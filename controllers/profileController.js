const Notification = require("../models/notificationModel");
const Profile = require("../models/profileModel");
const User = require("../models/usersModel");
const { asyncWrapper } = require("../utils/handlers");
const { filterObj, formatDate, countNum } = require("../utils/helpers");
const refactory = require("./handleRefactory");



//////////////////////////////////////////////////
// PROFILE IMPLEMENTATIONS
//////////////////////////////////////////////////
exports.becomeCreator = asyncWrapper(async function(req, res) {
    const userId = req.user._id;
    const user = await User.findOne({ _id: userId })
    const already_a_Creator = await Profile.findOne({ user: userId, isCreator: true })

    if(already_a_Creator) return res.json({
        message: "Cannot process request, You are already a creator!"
    })

    const creatorProfile = await Profile.findOneAndUpdate(
        { user: userId },
        { isCreator: true },
        { runValidators: true, new: true }
    );

    res.status(200).json({
        status: "success",
        message: "You are now a Creator!",
        data: creatorProfile
    })
});

exports.getAllProfiles = refactory.getAll(Profile, "profile")

exports.getProfileById = asyncWrapper(async function(req, res) {
    const userId = req.user._id;
    const creatorProfileId = req.params.id
    const myProfile = await Profile.findOne({ user: userId });

    const creatorProfile = await Profile.findOne({ _id: creatorProfileId, isCreator: true });
    const isFollowingCreator = creatorProfile.followers.includes(myProfile._id);
    const isFollowedByCreator = creatorProfile.following.includes(myProfile._id);

    const profileData = {
        ...creatorProfile?._doc,
        isFollowingCreator,
        ...(myProfile.isCreator && { isFollowedByCreator })
    };

    res.status(200).json({
        status: "success",
        data: { profile: profileData }
    })
})

exports.getMyProfile = asyncWrapper(async function(req, res) {
    const creatorId = req.user._id;

    const profile = await Profile.findOne({ user: creatorId });
    if(!profile.isCreator) return res.json({ message: "You are not yet a creator!" });

    res.status(200).json({
        status: "success",
        data: { profile }
    })
});

exports.updateProfile = asyncWrapper(async function(req, res) {
    const creatorId = req.user._id;

    const profile = await Profile.findOne({ user: creatorId });
    if(!profile.isCreator) return res.json({
        message: "You are not yet a creator!"
    });

    const filterArray = ["bio", "website", "country", "country", "city", "zipCode", "interests"];
    const filteredBody = filterObj(req.body, ...filterArray);

    const updatedProfile = await Profile.findOneAndUpdate(
        { user: creatorId }, filteredBody,
        { runValidators: true, new: true }
    );

    res.status(201).json({
        status: "success",
        message: "Profile Updated!",
        data: {
            profile: updatedProfile
        }
    })
});


exports.fetchCreators = asyncWrapper(async function(req, res) {
    const { limit, page } = req.query

    const userId = req.user._id;
    const myProfile = await Profile.findOne({ user: userId });

    const paginationOptions = {};
    if (limit) paginationOptions.limit = parseInt(limit);
    if (page) paginationOptions.skip = (parseInt(page) - 1) * paginationOptions.limit;

    // const creators = await Profile.find({
    //     _id: { $ne: myProfile._id },
    //     isCreator: true,
    //     followers: { $ne: myProfile._id },
    //     following: { $ne: myProfile._id },
    // })
    // .sort({
    //     $size: { followers: -1 }, // sort by followers in descending order
    //     $size: { following: 1 } // sort by followings in ascending order
    // })
    // .skip(paginationOptions.skip)
    // .limit(paginationOptions.limit);

    const creators = await Profile.aggregate([
        {
          $match: {
            _id: { $ne: myProfile._id },
            isCreator: true,
            followers: { $ne: myProfile._id },
            following: { $ne: myProfile._id }
          }
        },
        {
          $addFields: {
            followersCount: { $size: "$followers" },
            followingCount: { $size: "$following" }
          }
        },
        {
          $sort: {
            followersCount: -1,
            followingCount: 1
          }
        },
        {
          $skip: paginationOptions.skip
        },
        {
          $limit: paginationOptions.limit
        }
    ]);

    const creatorsData = await Promise.all(creators.map(async (creator) => {
        const creatorProfile = await Profile.findById(creator._id)
        const isFollowingCreator = creatorProfile.followers.includes(myProfile._id);
        const isFollowedByCreator = creatorProfile.following.includes(myProfile._id);
        return { ...creatorProfile?._doc, isFollowingCreator, ...(myProfile.isCreator && { isFollowedByCreator }) };
    }));
      
    const totalLength = creators.length;
    const totalPage = totalLength > limit ? totalLength / limit : 1;
    const remainingLength = totalLength - (paginationOptions.skip + creators.length);

    const responseData = {
        status: "success",
        totalPage, limit: +limit,
        currentPage: +page,
        totalCounts: totalLength,
        remainingCounts: paginationOptions.skip > totalPage ? 0 : remainingLength,
    }

    if(remainingLength < 0) {
        return res.json({
            ...responseData,
            message: `No more creator found`,
        })
    }

    res.status(200).json({
        ...responseData,
        data: { creators: creatorsData },
    })
});


//////////////////////////////////////////////////
// FOLLOW IMPLEMENTATIONS
//////////////////////////////////////////////////
exports.followCreator = asyncWrapper(async function(req, res) {
    const currentUserId = req.user._id;
    const creatorProfileId = req.params.id;

    const currentProfile = await Profile.findOne({ user: currentUserId });
    const profileToFollow = await Profile.findOne({ _id: creatorProfileId, isCreator: true });
    if(!profileToFollow) return res.json({ message: "Only creators can be followed" });

    if (currentProfile.following.includes(profileToFollow._id)) {
        return res.json({ message: "Already following creator" });
    }

    profileToFollow.followers.push(currentProfile._id);
    await profileToFollow.save({ validateBeforeSave: false });

    currentProfile.following.push(profileToFollow._id);
    await currentProfile.save({ validateBeforeSave: false });

    await Notification.create({
        userId: profileToFollow.user,
        title: `@${currentProfile.username}`,
        content: `started following you ${formatDate}`,
        extraPayload: { identifier: "Follower Id", value: currentProfile._id }
    });

    res.status(200).json({
        status: 'success',
        message: "Followed!",
    });
});

exports.followBackCreator = asyncWrapper(async function(req, res) {
    const currentUserId = req.user._id;
    const creatorProfileId = req.params.id;

    const currentProfile = await Profile.findOne({ user: currentUserId });
    const profileToFollowBack = await Profile.findOne({ _id: creatorProfileId, isCreator: true });
    if(!profileToFollowBack) return res.json({ message: "Only creators can be followed back" });

    if(currentProfile.following.includes(profileToFollowBack._id)) {
        return res.json({ message: "Already following creator" });
    }

    profileToFollowBack.followers.push(currentProfile._id);
    await profileToFollowBack.save({ validateBeforeSave: false });

    currentProfile.following.push(profileToFollowBack._id);
    await currentProfile.save({ validateBeforeSave: false });

    await Notification.create({
        user: profileToFollowBack._id,
        title: `@${currentProfile.username}`,
        content: `followed you back ${formatDate}`,
    });

    res.status(200).json({
        status: 'success',
        message: "Followed back!",
    });
});

exports.unfollowCreator = asyncWrapper(async function(req, res) {
    const currentUserId = req.user._id;
    const creatorProfileId = req.params.id;

    const currentProfile = await Profile.findOne({ user: currentUserId });
    const profileToUnfollow = await Profile.findOne({ _id: creatorProfileId, isCreator: true });

    if(!profileToUnfollow || !profileToUnfollow.followers.includes(currentProfile._id)) {
        return res.json({ message: "Only unfollow creator you already follow" });
    }

    profileToUnfollow.followers = profileToUnfollow.followers.filter((id) => {
        return id.toString() !== currentProfile._id.toString()
    });
    await profileToUnfollow.save({ validateBeforeSave: false });
    
    currentProfile.following = currentProfile.following.filter((id) => {
        return id.toString() !== profileToUnfollow._id.toString()
    });
    await currentProfile.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: "Unfollowed!",
    });
})

exports.getMyFollowers = asyncWrapper(async function(req, res) {
    const creatorId = req.user.id;
    const profile = await Profile.findOne({ user: creatorId, isCreator: true });
    if(!profile) return res.json({ message: "You are not a creator" });

    const followers = [...profile.followers];
    res.status(200).json({
        status: "success",
        count: countNum(followers.length),
        data: { followers }
    })
});

exports.getMyFollowings = asyncWrapper(async function(req, res) {
    const userId = req.user.id;

    const profile = await Profile.findOne({ user: userId });
    const followings = [...profile.following];

    res.status(200).json({
        status: "success",
        count: countNum(followings.length),
        data: { followings }
    })
});
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    creatorProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: mongoose.SchemaTypes.Mixed,
        required: true,
        trim: true,
    },
    slug: String,
    blogUrl: String,
    previewImg: {
        url: { type: String, required: true },
        public_id: String,
    },
    views: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true 
});


blogSchema.pre(/^find/, function (next) {
	this.populate({
        path: "creatorProfile",
        select: "_id username profileName"
    });
	next();
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;

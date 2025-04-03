const mongoose = require("mongoose");


const picSchema = new mongoose.Schema({
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
    description: String,
    preview: {
        url: { type: String, required: true },
        public_id: String
    },
    width: Number,
    height: Number,
    size: String,
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});


picSchema.pre(/^find/, function(next) {
    this.populate({
        path: "creatorProfile",
        select: "_id profileName",
    });

    next();
});


const Pic = mongoose.model("Pic", picSchema);
module.exports = Pic;
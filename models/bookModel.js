const mongoose = require("mongoose");
const slugify = require("slugify");

const bookSchema = new mongoose.Schema({
     creatorProfile: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile",
     },
     title: {
          type: String,
          required: true,
          trim: true,
     },
     specification: {
          author: {
               type: [String],
               required: true,
               trim: true,
          },
          description: {
               type: String,
               trim: true,
          },
          publishedYear: Number,
          genre: [String],
     },
     coverImage: {
          url: { type: String, required: true },
          public_id: String,
     },
     file: {
          url: { type: String, required: true },
          public_id: String
     },
     slug: String,
     likes: {
          type: Number,
          default: 0,
     },
}, {
     timestamps: true 
});



bookSchema.pre("save", function (next) {
	if (this.isNew || this.isModified("title")) {
		this.slug = slugify(this.title, { lower: true });
	}
	next();
});

bookSchema.pre(/^find/, function (next) {
	this.populate({
          path: "creatorProfile",
          select: "_id username profileName"
     });
	next();
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;

const mongoose = require("mongoose");

const bookModel = mongoose.Schema(
  {
    title: String,
    img: {
        type:String
    },
    imageURL: String,
    description: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("book", bookModel);

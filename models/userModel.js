const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userModel = mongoose.Schema(
  {
    passwordResetToken: {
      type: Number,
      default: 0,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      requied: [true, `field should not be empty`],
      minlength: [4, `minimum 4 charachters are required`],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: "Email address is required",
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: String,
    avatar: {
      type: String,
      default: "default.jpg",
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "book",
      },
    ],
  },
  { timestamps: true }
);

userModel.plugin(plm);

const user = mongoose.model("user", userModel);

module.exports = user;

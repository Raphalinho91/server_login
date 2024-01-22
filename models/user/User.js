const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    match: /^[a-zA-Z\s-]+$/,
  },
  lastName: {
    type: String,
    required: true,
    match: /^[a-zA-Z\s-]+$/,
  },
  email: {
    type: String,
    required: true,
    match: emailRegex,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (password) =>
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(password),
      message:
        "Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and be at least 8 characters long",
    },
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: (date) => !isNaN(Date.parse(date)),
      message: "Invalid date format for date of birth",
    },
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: () => uuid.v4(),
  },
  admin: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

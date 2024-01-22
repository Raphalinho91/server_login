const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserTokenSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expiration: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000),
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const UserToken = mongoose.model("UserToken", UserTokenSchema);

module.exports = UserToken;

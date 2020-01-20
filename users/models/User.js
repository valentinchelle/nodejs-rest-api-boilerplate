const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  familyname: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  google: {
    googleId: { type: String, required: false }
  },
  OAuthProvider: {
    type: String,
    required: false
  },
  OAuthId: {
    type: String,
    required: false
  }
});

module.exports = User = mongoose.model("users", UserSchema);

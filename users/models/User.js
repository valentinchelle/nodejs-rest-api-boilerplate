const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const userSchema = new Schema({
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
    // link
    type: String,
    required: false,
    default: ""
  },
  password: {
    type: String,
    required: false,
    select: false
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
  },

  permissionLevel: Number
});

// General Function for a model
userSchema.statics.findByEmail = function(email) {
  return this.find({ email: email });
};
/*
userSchema.statics.findById = function(id) {
  return super.findById(id).then(result => {
    result = result.toJSON();
    delete result._id;
    delete result.__v;
    return result;
  });
};
*/
userSchema.statics.create = function(dataEntity) {
  const new_entity = new this(dataEntity);
  return new_entity.save();
};

userSchema.statics.list = function(perPage, page) {
  return new Promise((resolve, reject) => {
    this.find()
      .limit(perPage)
      .skip(perPage * page)
      .exec(function(err, entities) {
        if (err) {
          reject(err);
        } else {
          resolve(entities);
        }
      });
  });
};

userSchema.statics.removeById = function(id) {
  return new Promise((resolve, reject) => {
    this.deleteOne({ _id: id }, err => {
      if (err) {
        reject(err);
      } else {
        resolve(err);
      }
    });
  });
};

userSchema.statics.patch = function(id, userData) {
  delete userData["permissionLevel"];
  delete userData["id"];

  // needs to Ensure no collision
  return new Promise((resolve, reject) => {
    this.findById(id, function(err, user) {
      if (err) reject(err);
      for (let i in userData) {
        user[i] = userData[i];
      }
      user.save(function(err, updatedUser) {
        if (err) return reject(err);
        resolve(updatedUser);
      });
    });
  });
};

mongoose.model("User", userSchema);

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

const Model = mongoose.model("Users", userSchema);

exports.model = Model;
// General Function for a model
exports.findByEmail = email => {
  return Model.find({ email: email });
};

exports.findById = id => {
  return Model.findById(id).then(result => {
    result = result.toJSON();
    delete result._id;
    delete result.__v;
    return result;
  });
};

exports.create = userData => {
  const user = new Model(userData);
  return user.save();
};

exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Model.find()
      .limit(perPage)
      .skip(perPage * page)
      .exec(function(err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

exports.patch = (id, userData) => {
  return new Promise((resolve, reject) => {
    Model.findById(id, function(err, user) {
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

exports.removeById = userId => {
  return new Promise((resolve, reject) => {
    Model.remove({ _id: userId }, err => {
      if (err) {
        reject(err);
      } else {
        resolve(err);
      }
    });
  });
};

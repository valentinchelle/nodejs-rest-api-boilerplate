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
  },

  permissionLevel: Number
});

// General Function for a model
userSchema.methods.findByEmail = email => {
  return Model.find({ email: email });
};
userSchema.methods.findById = id => {
  return Model.findById(id).then(result => {
    result = result.toJSON();
    delete result._id;
    delete result.__v;
    return result;
  });
};

userSchema.methods.create = dataEntity => {
  const new_entity = new Model(dataEntity);
  return new_entity.save();
};

userSchema.methods.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Model.find()
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

userSchema.methods.removeById = id => {
  return new Promise((resolve, reject) => {
    Model.remove({ _id: id }, err => {
      if (err) {
        reject(err);
      } else {
        resolve(err);
      }
    });
  });
};

userSchema.methods.patch = (id, userData) => {
  delete userData["permissionLevel"];
  delete userData["id"];
  // needs to Ensure no collision
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

mongoose.model("User", userSchema);

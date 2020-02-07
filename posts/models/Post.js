const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var uniqueValidator = require("mongoose-unique-validator");
const EntitySchema = new Schema(
  {
    slug: { type: String, lowercase: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tagList: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

EntitySchema.plugin(uniqueValidator, { message: "Is already taken" });

EntitySchema.statics.create = function(dataEntity) {
  const new_entity = new this(dataEntity);
  return new_entity.save();
};

EntitySchema.statics.list = function(perPage, page) {
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

EntitySchema.statics.removeById = function(id) {
  return new Promise((resolve, reject) => {
    this.remove({ _id: id }, err => {
      if (err) {
        reject(err);
      } else {
        resolve(err);
      }
    });
  });
};

EntitySchema.statics.patch = function(id, entityData) {
  // needs to Ensure no collision

  return new Promise((resolve, reject) => {
    this.findById(id, function(err, entity) {
      if (err) reject(err);
      for (let i in entityData) {
        entity[i] = entityData[i];
      }
      entity.save(function(err, updatedEntity) {
        if (err) return reject(err);
        resolve(updatedEntity);
      });
    });
  });
};

// Custom methods
EntitySchema.statics.findBySlug = function(slug) {
  return this.find({ slug: slug });
};

mongoose.model("Post", EntitySchema);

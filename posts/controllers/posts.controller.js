const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

exports.insert = (req, res, next) => {
  // Might need to be changed. which variable contains payload of the user ?
  User.findById(req.jwt.id)
    .then(function(user) {
      if (!user) {
        return res.status(400).send({ error: "User not provided" });
      }
      var post = new Post(req.body.data);
      post.author = user;
      return post
        .save()
        .then(function() {
          res.status(200).send({ data: post });
        })
        .catch(e => {
          return res.status(400).send({
            error: "Error saving post. Information might be incomplete."
          });
        });
    })
    .catch(e => {
      return res.status(400).send({ error: "No user find." });
    });
};

exports.getById = (req, res) => {
  Post.findById(req.params.id)
    .then(result => {
      res.status(200).send({ data: result });
    })
    .catch(e => {
      return res.status(400).send({ error: "Error. Probably Wrong id." });
    });
};

exports.patchById = (req, res) => {
  // We make sure they try to modify themselves if they don't have the right permission

  var patchedPost = req.body.data;
  // We make sure to not patch the author and id
  delete patchedPost["author"];
  delete patchedPost["id"];

  Post.patch(req.params.id, patchedPost)
    .then(result => {
      res.status(200).send({ data: result });
    })
    .catch(e => {
      return res.status(400).send({ error: "Error modifying the entity." });
    });
};

exports.list = (req, res) => {
  var page = 0;
  if (req.params.page) {
    page = req.params.page;
  }
  Post.list(20, page)
    .then(result => {
      res.send(result).status(200);
    })
    .catch(e => {
      return res.status(400).send({ error: "Probably invalid data" });
    });
};

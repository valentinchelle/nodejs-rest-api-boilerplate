const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

exports.insert = (req, res, next) => {
  // Might need to be changed. which variable contains payload of the user ?

  User.findById(req.jwt.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      var post = new Post(req.body.post);

      post.author = user;

      return post
        .save()
        .then(function() {
          console.log(post);
          return res.json({ post });
        })
        .catch(e => {
          return res.sendStatus(400);
        });
    })
    .catch(e => {
      return res.sendStatus(406);
    });
};

exports.getById = (req, res) => {
  Post.findById(req.params.id)
    .then(result => {
      res.status(200).send(result);
    })
    .catch(e => {
      return res.sendStatus(400);
    });
};

exports.patchById = (req, res) => {
  // We make sure to not patch the author and id
  if (req.body) {
    delete req.body["author"];
    delete req.body["id"];
  }
  // We make sure they try to modify themselves if they don't have the right permission

  var patchedPost = req.body.post;

  Post.patch(req.params.id, patchedPost)
    .then(result => {
      console.log(result);
      res.status(204).send({});
    })
    .catch(e => {
      console.log(e);
      return res.sendStatus(400);
    });
};

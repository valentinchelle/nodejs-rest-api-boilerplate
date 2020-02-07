//During the test the env variable is set to test
process.env.NODE_ENV = "test";

let MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
let mongoose = require("mongoose");
//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
let should = chai.should();

let mongoServer;
chai.use(chaiHttp);

describe("---------- Testing Posts Api ----------", function() {
  let mongoServer;
  let users_in_db = [];
  let posts_in_db = [];
  let jwttoken = null;
  let refresh_token = null;
  let jwttoken_admin = null;
  let refresh_token_admin = null;
  before(async () => {
    // Instantiate the server of test
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(
      mongoUri,
      { useNewUrlParser: true, useUnifiedTopology: true },
      err => {
        if (err) console.error(err);
      }
    );

    //  ----------------- DUMMY POSTS AND USERS-----------------
    const Post = mongoose.model("Post");
    const User = mongoose.model("User");
    for (let i = 0; i < 3; i++) {
      let permissionLevel = 0;
      if (i == 0) {
        permissionLevel = 2048;
      }

      let newUser = {
        name: "test_" + [i],
        email: "email_" + [i] + "@mail.com",
        password:
          "$2a$10$FGPRZ2EDJVT9Fr2pR5Q/6u8SzkhPJ8NLmQefv39UuqgIvDsVPFyJu", // corresponds to the hash of aaaaaa
        permissionLevel: permissionLevel
      };
      user = await User.create(newUser);

      let newPost = {
        title: "title of the post " + [i],
        content: "content of the post " + [i],
        tagList: ["tag1", "tag2", "tag" + [i]],
        author: user
      };

      post = await Post.create(newPost);
      posts_in_db.push(post);
      users_in_db.push(user);
    }

    //  ----------------- RETRIEVE DUMMY TOKEN USER AND ADMIN -----------------

    // Retrieves a token to test authentication methods
    // This one is for an admin account
    let authcontroller = require("../auth/controllers/auth.controller");
    payload_admin = {
      id: users_in_db[0].id,
      name: users_in_db[0].name,
      email: users_in_db[0].email,
      profilePicture: users_in_db[0].profilePicture,
      permissionLevel: users_in_db[0].permissionLevel
    };

    [jwttoken_admin, refresh_token_admin] = await authcontroller.generateTokens(
      payload_admin
    );
    jwttoken_admin = "Bearer " + jwttoken_admin;
    // This one is for an normal  account
    payload_normal = {
      id: users_in_db[1].id,
      name: users_in_db[1].name,
      email: users_in_db[1].email,
      profilePicture: users_in_db[1].profilePicture,
      permissionLevel: users_in_db[1].permissionLevel
    };

    [jwttoken, refresh_token] = await authcontroller.generateTokens(
      payload_normal
    );
    jwttoken = "Bearer " + jwttoken;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should get a valid list of the posts", function(done) {
    chai
      .request("http://localhost:5000")
      .get("/api/posts/feed")
      .end(function(err, res) {
        // We created three dummy posts so we expect 3 results
        res.body.should.have.length(3);
        res.body[0].should.have.property("author");
        res.body[0].should.have.property("content");
        res.body[0].should.have.property("title");
        res.body[0].should.have.property("tagList");
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });
  // -------------------- GET POST --------------------- //
  it("should get the post", function(done) {
    chai
      .request("http://localhost:5000")
      .get("/api/posts/" + posts_in_db[0]["_id"])
      .end(function(err, res) {
        res.body.should.have.property("data");
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });
  it("should not get the post: wrong id", function(done) {
    chai
      .request("http://localhost:5000")
      .get("/api/posts/ab")
      .end(function(err, res) {
        console.log(res.body);
        res.body.should.have.property("error");
        chai.expect(res).to.have.status(400);
        done(); // <= Call done to signal callback end
      });
  });

  // -------------------- CREATE POST --------------------- //
  it("should fail creating post : no token", function(done) {
    // we take the first user and try to get it
    chai
      .request("http://localhost:5000")
      .post("/api/posts")
      .type("form")
      .send({
        title: "title of the test post ",
        content: "content of the post ",
        tagList: ["tag1", "tag2", "tag"]
      })
      .end(function(err, res) {
        console.log(res.body);
        res.body.should.have.property("error");
        chai.expect(res).to.have.status(403);
        done(); // <= Call done to signal callback end
      });
  });
  it("should fail creating post :  incomplete content", function(done) {
    // we take the first user and try to get it
    chai
      .request("http://localhost:5000")
      .post("/api/posts")
      .set("authorization", jwttoken)
      .type("form")
      .send({
        title: "title of the test post ",
        tagList: ["tag1", "tag2", "tag"]
      })
      .end(function(err, res) {
        console.log(res.body);
        res.body.should.have.property("error");
        chai.expect(res).to.have.status(400);
        done(); // <= Call done to signal callback end
      });
  });

  it("should success creating post :  token", function(done) {
    // we take the first user and try to get it
    chai
      .request("http://localhost:5000")
      .post("/api/posts")
      .set("authorization", jwttoken)
      .send({
        data: {
          title: "title of the test post ",
          content: "content of the post ",
          tagList: ["tag1", "tag2", "tag"]
        }
      })
      .end(function(err, res) {
        res.body.should.have.property("data");
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });

  // -------------------- PATCH POST --------------------- //
  it("should not patch : not same author and not admin", function(done) {
    chai
      .request("http://localhost:5000")
      // we try to get a different user ( not the one providing the token)
      .patch("/api/posts/" + posts_in_db[2]["_id"])
      .send({
        data: {
          title: "title of the patched post"
        }
      })
      .set("authorization", jwttoken)
      .end(function(err, res) {
        console.log(res.body);
        res.body.should.have.property("error");
        chai.expect(res).to.have.status(403);
        done(); // <= Call done to signal callback end
      });
  });
  it("should patch : same author", function(done) {
    chai
      .request("http://localhost:5000")
      // we try to get a different user ( not the one providing the token)
      .patch("/api/posts/" + posts_in_db[1]["_id"])
      .send({
        data: {
          title: "title of the patched post"
        }
      })
      .set("authorization", jwttoken)
      .end(function(err, res) {
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });

  it("should patch : diff author but admin", function(done) {
    chai
      .request("http://localhost:5000")
      // we try to get a different user ( not the one providing the token)
      .patch("/api/posts/" + posts_in_db[2]["_id"])
      .send({
        data: {
          title: "title of the patched post"
        }
      })
      .set("authorization", jwttoken_admin)
      .end(function(err, res) {
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });
});

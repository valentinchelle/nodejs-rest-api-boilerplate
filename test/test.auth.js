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

describe("---------- Testing Auth Api ----------", function() {
  let mongoServer;
  let users_in_db = [];
  let jwttoken = null;
  let refresh_token = null;

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

    // Populate the test db
    const Post = mongoose.model("Post");
    const User = mongoose.model("User");
    for (let i = 0; i < 3; i++) {
      let newUser = {
        id: i,
        name: "test_" + [i],
        email: "email_" + [i] + "@mail.com",
        password: "$2a$10$FGPRZ2EDJVT9Fr2pR5Q/6u8SzkhPJ8NLmQefv39UuqgIvDsVPFyJu" // corresponds to the hash of aaaaaa
      };
      user = await User.create(newUser);
      users_in_db.push(user);
    }

    // Retrieves a token to test authentication methods

    let authcontroller = require("../auth/controllers/auth.controller");
    payload = {
      id: users_in_db[0].id,
      name: users_in_db[0].name,
      email: users_in_db[0].email,
      profilePicture: users_in_db[0].profilePicture
    };

    [jwttoken, refresh_token] = await authcontroller.generateTokens(payload);
    jwttoken = "Bearer " + jwttoken;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should fail register: password too short", function(done) {
    // we take the first user and try to get it
    chai
      .request("http://localhost:5000")
      .post("/api/auth/register")
      .type("form")
      .send({
        password: "aa",
        password2: "aa"
      })
      .end(function(err, res) {
        chai.expect(res).to.have.status(400);
        done(); // <= Call done to signal callback end
      });
  });

  it("should fail register: email already taken", function(done) {
    // we take the first user and try to get it
    chai
      .request("http://localhost:5000")
      .post("/api/auth/register")
      .type("form")
      .send({
        email: "email_1@mail.com",
        password: "aaaaaa",
        password2: "aaaaaa",
        name: "test"
      })
      .end(function(err, res) {
        chai.expect(res).to.have.status(400);
        done(); // <= Call done to signal callback end
      });
  });

  it("should register", function(done) {
    // we take the first user and try to get it
    chai
      .request("http://localhost:5000")
      .post("/api/auth/register")
      .type("form")
      .send({
        email: "test@mail.fr",
        password: "aaaaaa",
        password2: "aaaaaa",
        name: "test"
      })
      .end(function(err, res) {
        chai.expect(res).to.have.status(200);
        res.body.should.have.property("name");
        res.body.should.have.property("email");
        res.body.should.not.have.property("password");

        done(); // <= Call done to signal callback end
      });
  });
  it("should not login the user : wrong password", function(done) {
    // we use a wrong password here
    chai
      .request("http://localhost:5000")
      .post("/api/auth/login")
      .type("form")
      .send({
        email: "email_0@mail.com",
        password: "aaaaab"
      })
      .end(function(err, res) {
        chai.expect(res).to.have.status(400);
        res.body.should.not.have.property("token");
        res.body.should.not.have.property("refresh_token");

        done(); // <= Call done to signal callback end
      });
  });

  it("should not login the user : incomplete form", function(done) {
    // we use a wrong password here
    chai
      .request("http://localhost:5000")
      .post("/api/auth/login")
      .type("form")
      .send({
        email: "email_0@mail.com"
      })
      .end(function(err, res) {
        chai.expect(res).to.have.status(400);
        res.body.should.not.have.property("token");
        res.body.should.not.have.property("refresh_token");

        done(); // <= Call done to signal callback end
      });
  });

  it("should login the user", function(done) {
    chai
      .request("http://localhost:5000")
      .post("/api/auth/login")
      .type("form")
      .send({
        email: "email_0@mail.com",
        password: "aaaaaa"
      })
      .end(function(err, res) {
        chai.expect(res).to.have.status(200);
        res.body.should.have.property("token");
        res.body.should.have.property("refresh_token");
        res.body.should.not.have.property("password");

        done(); // <= Call done to signal callback end
      });
  });

  // ---------------------- Testing Token Handling ---------------------- //

  it("should not refresh the token : refresh_token_invalid", function(done) {
    chai
      .request("http://localhost:5000")
      .post("/api/auth/refresh")
      .type("form")
      .send({
        refresh_token: "aaa"
      })
      .end(function(err, res) {
        console.log(res.body);
        chai.expect(res).to.have.status(403);
        res.body.should.have.property("error");

        done(); // <= Call done to signal callback end
      });
  });

  it("should not refresh the token : wrong refresh token", function(done) {
    chai
      .request("http://localhost:5000")
      .post("/api/auth/refresh")
      .type("form")
      .set("authorization", jwttoken)
      .send({
        refresh_token: "000"
      })
      .end(function(err, res) {
        console.log(res.body);
        chai.expect(res).to.have.status(403);
        res.body.should.have.property("error");
        done(); // <= Call done to signal callback end
      });
  });

  it("should not refresh the token : jwt missing", function(done) {
    chai
      .request("http://localhost:5000")
      .post("/api/auth/refresh")
      .type("form")
      .send({
        refresh_token: refresh_token
      })
      .end((err, res) => {
        console.log(res.body);
        chai.expect(res).to.have.status(403);
        res.body.should.have.property("error");
        done(); // <= Call done to signal callback end
      });
  });

  it("should refresh the token : jwt ", function(done) {
    chai
      .request("http://localhost:5000")
      .post("/api/auth/refresh")
      .type("form")
      .set("authorization", jwttoken)
      .send({
        refresh_token: refresh_token
      })

      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        res.body.should.have.property("token");
        res.body.should.have.property("refresh_token");
        chai.expect("Bearer " + res.body.token).to.not.equal(jwttoken);
        done(); // <= Call done to signal callback end
      });
  });
});

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

describe("---------- Testing Users Api ----------", function() {
  let mongoServer;
  let users_in_db = [];
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

    // Populate the test db
    const Post = mongoose.model("Post");
    const User = mongoose.model("User");
    for (let i = 0; i < 3; i++) {
      let permissionLevel = 0;
      if (i == 0) {
        permissionLevel = 2048;
      }

      let newUser = {
        id: i,
        name: "test_" + [i],
        email: "email_" + [i] + "@mail.com",
        password:
          "$2a$10$FGPRZ2EDJVT9Fr2pR5Q/6u8SzkhPJ8NLmQefv39UuqgIvDsVPFyJu", // corresponds to the hash of aaaaaa
        permissionLevel: permissionLevel
      };
      user = await User.create(newUser);
      users_in_db.push(user);
    }

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

  it("should get a valid list of the users without passwords", function(done) {
    chai
      .request("http://localhost:5000")
      .get("/api/users/")
      .end(function(err, res) {
        // We created three fake users so we expect 3 results
        res.body.should.have.length(3);
        res.body[0].should.have.property("name");
        res.body[0].should.have.property("email");
        res.body[0].should.not.have.property("password");
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });
  // -------------------- GET User --------------------- //
  it("should not get the user: no jwt provided", function(done) {
    chai
      .request("http://localhost:5000")
      .get("/api/users/" + users_in_db[0]["_id"])
      .end(function(err, res) {
        console.log(res.body);
        chai.expect(res).to.have.status(403);
        done(); // <= Call done to signal callback end
      });
  });
  it("should not get the user: wrong id", function(done) {
    chai
      .request("http://localhost:5000")
      .get("/api/users/ab")
      .set("authorization", jwttoken)
      .end(function(err, res) {
        res.body.should.have.property("error");
        chai.expect(res).to.have.status(400);
        done(); // <= Call done to signal callback end
      });
  });
  it("should get the user", function(done) {
    chai
      .request("http://localhost:5000")
      // we try to get a different user ( not the one providing the token)
      .get("/api/users/" + users_in_db[2]["_id"])
      .set("authorization", jwttoken)
      .end(function(err, res) {
        res.body.should.have.property("name");
        res.body.should.have.property("email");
        res.body.should.not.have.property("password");
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });

  // -------------------- Patch User --------------------- //
  it("should not patch : not same user and not admin", function(done) {
    chai
      .request("http://localhost:5000")
      // we try to get a different user ( not the one providing the token)
      .patch("/api/users/" + users_in_db[2]["_id"])
      .send({
        name: "test2",
        password: "aa",
        password2: "aa"
      })
      .set("authorization", jwttoken)
      .end(function(err, res) {
        console.log(res.body);
        chai.expect(res).to.have.status(403);
        done(); // <= Call done to signal callback end
      });
  });
  it("should patch : admin", function(done) {
    chai
      .request("http://localhost:5000")
      // we try to get a different user ( not the one providing the token)
      .patch("/api/users/" + users_in_db[1]["_id"])
      .send({
        name: "test2",
        password: "aa",
        password2: "aa"
      })
      .set("authorization", jwttoken_admin)
      .end(function(err, res) {
        console.log(res.body);
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });
  it("should patch : same user", function(done) {
    chai
      .request("http://localhost:5000")
      // we try to get a different user ( not the one providing the token)
      .patch("/api/users/" + users_in_db[1]["_id"])
      .send({
        name: "test2",
        password: "aa",
        password2: "aa"
      })
      .set("authorization", jwttoken)
      .end(function(err, res) {
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });
  // -------------------- Delete User --------------------- //

  it("should not delete the user : not permission", function(done) {
    chai
      .request("http://localhost:5000")
      // we try to get a different user ( not the one providing the token)
      .delete("/api/users/" + users_in_db[2]["_id"])
      .set("authorization", jwttoken)
      .end(function(err, res) {
        res.body.should.have.property("error");
        chai.expect(res).to.have.status(403);
        done(); // <= Call done to signal callback end
      });
  });

  it("should delete the user with admin token", function(done) {
    chai
      .request("http://localhost:5000")
      // we try to get a different user ( not the one providing the token)
      .delete("/api/users/" + users_in_db[2]["_id"])
      .set("authorization", jwttoken_admin)
      .end(function(err, res) {
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });
});

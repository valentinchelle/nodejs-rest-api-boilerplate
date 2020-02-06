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

describe("Testing Users Model", function() {
  let mongoServer;
  let users_in_db = [];
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
        email: "email_" + [i],
        password: "$2a$10$FGPRZ2EDJVT9Fr2pR5Q/6u8SzkhPJ8NLmQefv39UuqgIvDsVPFyJu" // corresponds to the hash of aaaaaa
      };
      user = await User.create(newUser);
      users_in_db.push(user);
    }
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  var token = null;
  /*
  before(function(done) {
    request(url)
      .post("/user/token")
      .send({ _id: user1._id, password: user1.password })
      .end(function(err, res) {
        token = res.body.token; // Or something
        done();
      });
  });
  */
  it("should get a valid list of the users without passwords", function(done) {
    chai
      .request("http://localhost:5000")
      .get("/api/users/")
      .set("Authorization", "Bearer " + token)
      .end(function(err, res) {
        res.body.should.have.length(3);
        res.body[0].should.have.property("name");
        res.body[0].should.have.property("email");
        res.body[0].should.not.have.property("password");
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });

  it("should get a valid token for user: user1", function(done) {
    // we take the first user and try to get it
    chai
      .request("http://localhost:5000")
      .get("/api/users/" + users_in_db[0]["_id"])
      .end(function(err, res) {
        // Three users so three results
        console.log(res.body);
        chai.expect(res).to.have.status(403);
        done(); // <= Call done to signal callback end
      });
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
        // Three users so three results
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
        // Three users so three results
        res.body.should.have.property("name");
        res.body.should.have.property("email");
        res.body.should.not.have.property("password");
        chai.expect(res).to.have.status(200);
        done(); // <= Call done to signal callback end
      });
  });
});

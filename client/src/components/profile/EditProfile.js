import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Link, withRouter } from "react-router-dom";
import { patchUser } from "../../actions/authActions";
// reactstrap components
import { Button, Card, Container, Row, Col } from "reactstrap";

// reactstrap components
import {
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup
} from "reactstrap";
// core components
import DemoNavbar from "../Navbars/DemoNavbar.jsx";
import SimpleFooter from "../Footers/SimpleFooter.jsx";

class EditProfile extends React.Component {
  constructor(props) {
    super(props);
    const { user } = this.props.auth;
    console.log(user);
    this.state = {
      id: user.id,
      email: user.email,
      password: "",
      password2: "",
      name: user.name,
      errors: {}
    };
  }

  componentDidMount() {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    this.refs.main.scrollTop = 0;
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };
  onSubmit = e => {
    e.preventDefault();

    const userData = {
      id: this.state.id,
      email: this.state.email,
      name: this.state.name
    };
    // If also modified password
    if (this.state.password !== "") {
      if (this.state.password !== this.state.password2) {
        console.log("error : Password not matching !");
      } else {
        userData.password = this.state.password;
      }
    }
    this.props.patchUser(userData);
  };

  render() {
    const { user } = this.props.auth;
    return (
      <>
        <DemoNavbar />
        <main className="profile-page" ref="main">
          <section className="section-profile-cover section-shaped my-0">
            {/* Circles background */}
            <div className="shape shape-style-1 shape-default alpha-4">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            {/* SVG separator */}
            <div className="separator separator-bottom separator-skew">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                version="1.1"
                viewBox="0 0 2560 100"
                x="0"
                y="0"
              >
                <polygon
                  className="fill-white"
                  points="2560 0 2560 100 0 100"
                />
              </svg>
            </div>
          </section>
          <section className="section">
            <Container>
              <Card className="card-profile shadow mt--300 bg-secondary ">
                <CardHeader className="bg-white">
                  <Row className="justify-content-center">
                    <Col className="order-lg-2" lg="3">
                      <div className="card-profile-image">
                        <a href="#pablo" onClick={e => e.preventDefault()}>
                          <img
                            alt="..."
                            className="rounded-circle"
                            src={
                              user.profilePicture
                                ? user.profilePicture
                                : require("../../assets/img/theme/team-4-800x800.jpg")
                            }
                          />
                        </a>
                      </div>
                    </Col>
                    <Col
                      className="order-lg-3 text-lg-right align-self-lg-center"
                      lg="4"
                    >
                      <div className="card-profile-actions py-4 mt-lg-0">
                        <Link to="/profile">
                          <Button className="mr-4" color="default" size="sm">
                            Go back to profile
                          </Button>
                        </Link>
                      </div>
                    </Col>
                    <Col className="order-lg-1" lg="4"></Col>
                  </Row>
                  <div className="text-center mt-5">
                    <h3>
                      {user.name}
                      <span className="font-weight-light">, 27</span>
                    </h3>
                  </div>
                </CardHeader>
                <div className="mt-5 py-5text-center">
                  <Row className="justify-content-center">
                    <Col lg="9">
                      <Form role="form" noValidate onSubmit={this.onSubmit}>
                        <FormGroup className="mb-3">
                          <InputGroup className="input-group-alternative">
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <i className="ni ni-circle-08" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              placeholder="Name"
                              type="input"
                              onChange={this.onChange}
                              value={this.state.name}
                              id="name"
                            />
                          </InputGroup>
                        </FormGroup>
                        <FormGroup className="mb-3">
                          <InputGroup className="input-group-alternative">
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <i className="ni ni-email-83" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              placeholder="Email"
                              type="email"
                              onChange={this.onChange}
                              value={this.state.email}
                              id="email"
                            />
                          </InputGroup>
                        </FormGroup>
                        <FormGroup>
                          <InputGroup className="input-group-alternative">
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <i className="ni ni-lock-circle-open" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              placeholder="Password"
                              type="password"
                              autoComplete="off"
                              onChange={this.onChange}
                              value={this.state.password}
                              id="password"
                            />
                          </InputGroup>
                        </FormGroup>

                        <FormGroup>
                          <InputGroup className="input-group-alternative">
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <i className="ni ni-lock-circle-open" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              placeholder="Re-enter Password"
                              type="password"
                              autoComplete="off"
                              onChange={this.onChange}
                              value={this.state.password2}
                              id="password2"
                            />
                          </InputGroup>
                        </FormGroup>

                        <div className="text-center">
                          <Button
                            className="my-4"
                            color="primary"
                            type="submit"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Container>
          </section>
        </main>
        <SimpleFooter />
      </>
    );
  }
}

EditProfile.propTypes = {
  auth: PropTypes.object.isRequired,
  patchUser: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { patchUser })(EditProfile);

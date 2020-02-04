import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { listPosts } from "../../actions/postActions";
import { Link, withRouter } from "react-router-dom";
// reactstrap components
import { Button, Card, Container, Row, Col } from "reactstrap";

// core components
import DemoNavbar from "../Navbars/DemoNavbar.jsx";
import SimpleFooter from "../Footers/SimpleFooter.jsx";

class ListPosts extends React.Component {
  componentDidMount() {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    this.refs.main.scrollTop = 0;

    this.props.listPosts(0);
  }

  render() {
    const listposts = this.props.post.listposts;
    console.log(listposts);
    const { user } = this.props.auth;
    return (
      <>
        <DemoNavbar />
        <main ref="main">
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
          </section>
          <section className="section">
            <Container className=" mt-300">
              {listposts &&
                listposts.map((post, index) => {
                  return (
                    <Card
                      key={index}
                      className={
                        "card-profile shadow mt-5 " +
                        (index === 0 ? "mt--300" : "")
                      }
                    >
                      <div className="px-4">
                        <div className="mt-5 py-5 text-center">
                          <Row className="justify-content-center">
                            <Col lg="9">
                              <p>{post.content}</p>
                              <a
                                href="#pablo"
                                onClick={e => e.preventDefault()}
                              >
                                Show more
                              </a>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </Container>
          </section>
        </main>
        <SimpleFooter />
      </>
    );
  }
}

ListPosts.propTypes = {
  listPosts: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  post: state.post
});

export default connect(mapStateToProps, { listPosts })(ListPosts);

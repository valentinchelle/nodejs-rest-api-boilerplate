import React, { Component, Text } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";

import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Alert } from "reactstrap";

class FlashAlert extends React.Component {
  constructor() {
    super();
    this.state = {
      showAlert: true
    };
  }
  componentWillReceiveProps(nextProps) {
    console.log("NewProps");
    console.log(nextProps);
    if (nextProps.errors) {
      console.log("showing true");
      this.setState({
        showAlert: true
      });
      setTimeout(() => {
        console.log("timeout");
        this.setState({
          showAlert: false
        });
      }, 2000);
    }
  }
  render() {
    const { errors } = this.props;
    console.log(errors);
    console.log(this.props);
    console.log(this.state);
    console.log((errors !== undefined) & this.state.showAlert);
    if (errors.data) {
      console.log(errors.data.email);
    }
    return (errors.data !== undefined) & this.state.showAlert ? (
      <Alert
        color="warning"
        style={{
          position: "absolute",
          top: 100,
          right: 50,
          paddingRight: 20,
          zIndex: 1
        }}
      >
        <span className="alert-inner--text">
          <strong>Error!</strong> <a>{errors.data.email}</a>
        </span>
      </Alert>
    ) : (
      <div />
    );
  }
}

FlashAlert.propTypes = {
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  errors: state.errors
});

export default connect(mapStateToProps)(FlashAlert);

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
    if (nextProps.errors) {
      this.setState({
        showAlert: true
      });
      setTimeout(() => {
        this.setState({
          showAlert: false
        });
      }, 2000);
    }
  }
  render() {
    const { errors } = this.props;
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

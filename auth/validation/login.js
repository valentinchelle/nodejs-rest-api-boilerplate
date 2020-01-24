const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};
  if (!data.email || !data.password) {
    errors.auth = "Request invalid";
  }
  // Convert empty fields to an empty string so we can use validator functions
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  // Email checks
  if (Validator.isEmpty(data.email)) {
    errors.auth = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.auth = "Email is invalid";
  }
  // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.auth = "Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

import axios from "axios";
import jwt_decode from "jwt-decode";
import store from "./../store";
import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING } from "./types";

// Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/auth/register", userData)
    .then(res => history.push("/login"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// Patch User
export const patchUser = (userData, history) => dispatch => {
  axios
    .patch("/api/users/" + userData.id, userData)
    .then(res => {
      // We refresh the content of the store
      dispatch(refreshToken());
      return res;
    })
    .catch(err => {
      console.log(err);
      dispatch({
        type: GET_ERRORS,
        payload: err.response ? err.response : "Unknown Error"
      });
      return err;
    });
};

// Login - get user token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/auth/login", userData)
    .then(res => {
      // Save to localStorage
      console.log(res);
      // Set token to localStorage
      const token = res.data.token;
      const refreshToken = res.data.refresh_token;
      // Set token to Auth header
      var decoded = setAuthToken(token, refreshToken);
      // Decode token to get user data
      return decoded;
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response
      });
      return err.response;
    });
};

export const setAuthToken = (jwtToken, refreshToken) => {
  // Except the jwttoken to be like : "Bearer adsfkbgasdif"
  if (jwtToken && refreshToken) {
    // Apply authorization token to every request if logged in

    localStorage.setItem("jwtToken", jwtToken);
    localStorage.setItem("refreshToken", refreshToken);
    axios.defaults.headers.common["Authorization"] = jwtToken;
    // Decode token to get user data
    const decoded = jwt_decode(jwtToken);
    // Set current user
    store.dispatch(setCurrentUser(decoded));
    return decoded;
  } else {
    // Delete auth header
    console.log("Couldn't auth. Some tokens might be missing.");
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Used to set a JWT after OAuth
export const setJWTtoken = raw_token => {
  if (raw_token !== undefined) {
    let token = "Bearer " + raw_token;
    localStorage.setItem("jwtToken", token);
    // Set token to Auth header
    setAuthToken(token);
    // Decode token to get user data
    const decoded = jwt_decode(token);
    // Set current user
    store.dispatch(setCurrentUser(decoded));
  }
};

// Set logged in user
export const setCurrentUser = decoded => {
  console.log("During dispatching ");
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  };
};

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("refreshToken");
  // Remove auth header for future requests
  setAuthToken(false, false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};

export const refreshToken = () => dispatch => {
  axios
    .post("/api/auth/refresh", {
      refresh_token: localStorage.getItem("refreshToken")
    })
    .then(res => {
      console.log(res);
      var jwtToken = res.data.token;
      var refreshToken = res.data.refresh_token;
      var decoded = setAuthToken(jwtToken, refreshToken);
      return decoded;
    })
    .catch(err => {
      console.log(err);
      dispatch({
        type: GET_ERRORS,
        payload: err.response ? err.response : "Unable to refresh the session."
      });
      return err;
    });
};

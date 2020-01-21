import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { setAuthToken } from "./actions/authActions";
import { browserHistory } from "react-router";

import { setCurrentUser, logoutUser, setJWTtoken } from "./actions/authActions";
import { Provider } from "react-redux";
import store from "./store";

import Landing from "./views/examples/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

import PrivateRoute from "./components/private-route/PrivateRoute";
import Profile from "./components/profile/Profile";
import EditProfile from "./components/profile/EditProfile";
import FlashAlert from "./components/layout/FlashAlert";
// Check for token to keep user logged in
if (
  localStorage.jwtToken &&
  localStorage.jwtToken !== "Bearer null" &&
  localStorage.refreshToken
) {
  // Set auth token header auth
  const token = localStorage.jwtToken;

  const refreshToken = localStorage.refreshToken;
  setAuthToken(token, refreshToken);
  // Decode token and get user info and exp
  const decoded = jwt_decode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
  // Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());

    // Redirect to login
    window.location.href = "./login";
  }
}
class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <FlashAlert />
            <Route exact path="/" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />

            <Switch>
              <PrivateRoute exact path="/profile" component={Profile} />
              <PrivateRoute
                exact
                path="/edit-profile"
                component={EditProfile}
              />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;

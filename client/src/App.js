import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";

import { setCurrentUser, logoutUser, setJWTtoken } from "./actions/authActions";
import { Provider } from "react-redux";
import store from "./store";

import Landing from "./views/examples/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

import PrivateRoute from "./components/private-route/PrivateRoute";
import Profile from "./components/profile/Profile";
import FlashAlert from "./components/layout/FlashAlert";
// Check for token to keep user logged in
if (localStorage.jwtToken && localStorage.jwtToken !== "Bearer null") {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
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
  componentDidMount(req, res) {
    let token = null;
    let search = window.location.search;
    let params = new URLSearchParams(search);
    if (params) {
      token = params.get("token");
      if (token) {
        setJWTtoken(token);
      }
    }
  }
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
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;

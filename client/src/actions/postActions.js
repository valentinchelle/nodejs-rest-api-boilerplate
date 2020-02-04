import axios from "axios";
import jwt_decode from "jwt-decode";
import store from "./../store";
import { GET_ERRORS, SET_LIST_POSTS } from "./types";

export const addPost = post => dispatch => {
  var postData = { post: post };
  axios
    .post("/api/posts/", postData)
    .then(res => {
      console.log(res);
      return res;
    })
    .catch(err => {
      console.log(err);
      dispatch({
        type: GET_ERRORS,
        payload: err.response
      });
      return err.response;
    });
};

export const listPosts = page => dispatch => {
  var page_to_display = 0;
  if (page) {
    page_to_display = page;
  }
  axios
    .get("/api/posts/feed/" + page_to_display)
    .then(res => {
      dispatch({
        type: SET_LIST_POSTS,
        payload: res.data
      });
    })
    .catch(err => {
      console.log(err);
      dispatch({
        type: GET_ERRORS,
        payload: err.response
      });
    });
};

import { SET_LIST_POSTS } from "../actions/types";

const initialState = {
  listposts: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_LIST_POSTS:
      return { listposts: action.payload };
    default:
      return state;
  }
}

import {
    FETCH_PROJECTLIST_BEGIN,
    FETCH_PROJECTLIST_SUCCESS,
    FETCH_PROJECTLIST_FAILURE
  } from '../ServiceActions';
  
  const initialState = {
    items: [],
    loading: false,
    error: null
  };
  
  export default function projectListReducer(state = initialState, action) {
    switch(action.type) {
      case FETCH_PROJECTLIST_BEGIN:
        // Mark the state as "loading" so we can show a spinner or something
        // Also, reset any errors. We're starting fresh.
        return {
          ...state,
          loading: true,
          error: null
        };
  
      case FETCH_PROJECTLIST_SUCCESS:
        // All done: set loading "false".
        // Also, replace the items with the ones from the server
        return {
          ...state,
          loading: false,
          items: action.payload.projects
        };
  
      case FETCH_PROJECTLIST_FAILURE:
        // The request failed. It's done. So set loading to "false".
        // Save the error, so we can display it somewhere.
        // Since it failed, we don't have items to display anymore, so set `items` empty.
        //
        // This is all up to you and your app though:
        // maybe you want to keep the items around!
        // Do whatever seems right for your use case.
        return {
          ...state,
          loading: false,
          error: action.payload.error,
          items: []
        };
  
      default:
        // ALWAYS have a default case in a reducer
        return state;
    }
  }
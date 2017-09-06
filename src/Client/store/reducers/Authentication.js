import {AuthenticationConstants } from '../../../constants';

// var INITIAL_STATE = { Authentication: {groupName:'', documents:[], error:null, loading: false} }
var INITIAL_STATE = { data:{}, error:null, submitting: false}

export default function(state = INITIAL_STATE, action) {
    // console.log('AgendasAndMinutes reducer processing:' + JSON.stringify(action));
    let error;
    switch(action.type) {
        case AuthenticationConstants.PUSH_DATA:// start fetching docs and set submitting = true
        // console.log('Authentication Reducer processing PUSH_DATA:' + JSON.stringify(action.groupName));
            return { ...state,  data:{}, error: null, submitting: true };
        case AuthenticationConstants.PUSH_DATA_SUCCESS:// return list of posts and make submitting = false
            // console.log('Authentication Reducer processing SUCCESS:' + JSON.stringify(action.payload));
            return { ...state, data: {token: action.payload.token}, error:null, submitting: false };
        case AuthenticationConstants.PUSH_DATA_FAILURE:// return error and make submitting = false
            // console.log('Authentication Reducer processing FAILURE:' + JSON.stringify(action));
            error = action.payload || {message: action.payload.message};//2nd one is network or server down errors
            return { ...state, data: {}, error: error, submitting: false };
        default:
        // console.log('Authentication Reducer default:' + JSON.stringify(action.type));
        // console.log('Authentication Reducer default state:' + JSON.stringify(state));
          return state;
}
}

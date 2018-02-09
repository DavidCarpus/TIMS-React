import {AuthenticationConstants } from '../../../constants';

var INITIAL_STATE = { data:{}, error:null, submitting: false}

export default function(state = INITIAL_STATE, action) {
    let error;
    switch(action.type) {
        case AuthenticationConstants.PUSH_DATA:
            return { ...state,  data:{}, error: null, submitting: true };
        case AuthenticationConstants.PUSH_DATA_SUCCESS:
            return { ...state, data: {token: action.payload.token}, error:null, submitting: false };
        case AuthenticationConstants.PUSH_DATA_FAILURE:
            error = action.payload || {message: action.payload.message};//2nd one is network or server down errors
            return { ...state, data: {}, error: error, submitting: false };
        default:
          return state;
}
}

import {AlertRequestsDataConstants } from '../../../constants';

var INITIAL_STATE = { data:{}, error:null, submitting: false}

export default function(state = INITIAL_STATE, action) {
    let error;
    switch(action.type) {
        case AlertRequestsDataConstants.PUSH_DATA:
            return { ...state,  data:{}, error: null, submitting: true };
        case AlertRequestsDataConstants.PUSH_DATA_SUCCESS:
            return { ...state, data: action.payload, error:null, submitting: false };
        case AlertRequestsDataConstants.PUSH_DATA_FAILURE:
            error = action.payload || {message: action.payload.message};//2nd one is network or server down errors
            return { ...state, data: {}, error: error, submitting: false };
        default:
          return state;
}
}

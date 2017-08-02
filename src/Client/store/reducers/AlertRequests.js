import {AlertRequestsDataConstants } from '../../../constants';

// var INITIAL_STATE = { agendasAndMinutes: {groupName:'', documents:[], error:null, loading: false} }
var INITIAL_STATE = { data:{}, error:null, submitting: false} 

export default function(state = INITIAL_STATE, action) {
    // console.log('AgendasAndMinutes reducer processing:' + JSON.stringify(action));
    let error;
    switch(action.type) {
        case AlertRequestsDataConstants.PUSH_DATA:// start fetching docs and set submitting = true
        // console.log('agendasAndMinutes Reducer processing PUSH_DATA:' + JSON.stringify(action.groupName));
            return { ...state,  data:{}, error: null, submitting: true };
        case AlertRequestsDataConstants.PUSH_DATA_SUCCESS:// return list of posts and make submitting = false
            console.log('agendasAndMinutes Reducer processing SUCCESS:' + JSON.stringify(action.payload));
            return { ...state, data: action.payload, error:null, submitting: false };
        case AlertRequestsDataConstants.PUSH_DATA_FAILURE:// return error and make submitting = false
        console.log('agendasAndMinutes Reducer processing FAILURE:' + JSON.stringify(action));
            error = action.payload || {message: action.payload.message};//2nd one is network or server down errors
            return { ...state, data: {}, error: error, submitting: false };
        default:
        // console.log('agendasAndMinutes Reducer default:' + JSON.stringify(action.type));
        // console.log('agendasAndMinutes Reducer default state:' + JSON.stringify(state));
          return state;
}
}

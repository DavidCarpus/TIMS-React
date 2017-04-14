import {PublicDocumentsConstants } from '../../constants';

var INITIAL_STATE = { agendasAndMinutes: {groupName:'', documents:[], error:null, loading: false} }

export default function(state = INITIAL_STATE, action) {
    // console.log('AgendasAndMinutes reducer processing:' + JSON.stringify(action));
    let error;
    switch(action.type) {
        case PublicDocumentsConstants.FETCH_MEETING_DOCS:// start fetching docs and set loading = true
        console.log('agendasAndMinutes Reducer processing FETCH_MEETING_DOCS:' + JSON.stringify(action.groupName));
            return { ...state,  groupName:action.groupName, documents:[], error: null, loading: true };
        case PublicDocumentsConstants.FETCH_MEETING_DOCS_SUCCESS:// return list of posts and make loading = false
            console.log('agendasAndMinutes Reducer processing SUCCESS:' + JSON.stringify(action.groupName));
            return { ...state, groupName:action.groupName, documents: action.payload, error:null, loading: false };
        case PublicDocumentsConstants.FETCH_MEETING_DOCS_FAILURE:// return error and make loading = false
        console.log('agendasAndMinutes Reducer processing FAILURE:' + JSON.stringify(action));
            error = action.payload || {message: action.payload.message};//2nd one is network or server down errors
            return { ...state, documents: [], error: error, loading: false };
        default:
        // console.log('agendasAndMinutes Reducer default:' + JSON.stringify(action.type));
        // console.log('agendasAndMinutes Reducer default state:' + JSON.stringify(state));
          return state;
}
}

import {PublicDocumentsConstants } from '../../../constants';

var INITIAL_STATE = { agendasAndMinutes: {groupName:'', documents:{}, error:null, loading: false} }

export default function(state = INITIAL_STATE, action) {
    let error;
    switch(action.type) {
        case PublicDocumentsConstants.FETCH_MEETING_DOCS:
            return { ...state,  groupName:action.groupName, documents:{}, error: null, loading: true };
        case PublicDocumentsConstants.FETCH_MEETING_DOCS_SUCCESS:
            return { ...state, groupName:action.groupName, documents: action.payload, error:null, loading: false };
        case PublicDocumentsConstants.FETCH_MEETING_DOCS_FAILURE:
            error = action.payload || {message: action.payload.message};//2nd one is network or server down errors
            return { ...state, documents: {}, error: error, loading: false };
        default:
          return state;
}
}

import { PublicDocumentsConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'', documents:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case PublicDocumentsConstants.FETCH_GROUP_DOCS:
            return { ...state,  groupName:action.groupName, documents:[], error: null, loading: true };
        case PublicDocumentsConstants.FETCH_GROUP_DOCS_SUCCESS:
            return { ...state, groupName:action.groupName, documents: action.payload, error:null, loading: false };
        case PublicDocumentsConstants.RESET_GROUP_DOCS:
            return { ...state,  groupName:action.groupName, documents:[], error: null, loading: true };

        default:
          return state;
}
}

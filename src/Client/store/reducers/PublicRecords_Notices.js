import { PublicDocumentsConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'', documents:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('AgendasAndMinutes reducer processing:' + JSON.stringify(action));
    // let error;
    switch(action.type) {
        case PublicDocumentsConstants.FETCH_GROUP_NOTICES:// start fetching docs and set loading = true
        // console.log('PublicRecords Reducer processing FETCH_GROUP_NOTICES:' + JSON.stringify(action));
            return { ...state,  groupName:action.groupName, documents:[], error: null, loading: true };
        case PublicDocumentsConstants.FETCH_GROUP_NOTICES_SUCCESS:// return list of posts and make loading = false
            if (! action.groupName) {
                // eslint-disable-next-line no-debugger
                debugger;
            }
            // console.log('PublicRecords Reducer processing SUCCESS:' + JSON.stringify(action.groupName));
            return { ...state, groupName:action.groupName, documents: action.payload, error:null, loading: false };
        case PublicDocumentsConstants.RESET_GROUP_NOTICES:// start fetching docs and set loading = true
        // console.log('PublicRecords Reducer processing RESET_GROUP_NOTICES:' + JSON.stringify(action));
            return { ...state,  groupName:action.groupName, documents:[], error: null, loading: true };

        default:
        // console.log('PublicRecords Reducer default:' + JSON.stringify(action.type));
        // console.log('PublicRecords Reducer default state:' + JSON.stringify(state));
          return state;
}
}

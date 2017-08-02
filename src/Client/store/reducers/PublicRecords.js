import { PublicDocumentsConstants } from '../../../constants';

var INITIAL_STATE = { recordtype:'', publicRecords:{}, error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('AgendasAndMinutes reducer processing:' + JSON.stringify(action));
    // let error;
    switch(action.type) {
        case PublicDocumentsConstants.FETCH_PUBLIC_DOCS:// start fetching docs and set loading = true
        // console.log('PublicRecords Reducer processing FETCH_PUBLIC_DOCS:' + JSON.stringify(action));
            return { ...state,  recordtype:action.recordtype, publicRecords:{}, error: null, loading: true };
        case PublicDocumentsConstants.FETCH_PUBLIC_DOCS_SUCCESS:// return list of posts and make loading = false
        // console.log('PublicRecords Reducer processing SUCCESS:' + JSON.stringify(action.recordtype));
        // console.log('PublicRecords Reducer processing SUCCESS:' + JSON.stringify(action.payload));

            return { ...state, recordtype:action.recordtype, publicRecords: action.payload, error:null, loading: false };
        case PublicDocumentsConstants.RESET_GROUP_DOCS:// start fetching docs and set loading = true
        // console.log('PublicRecords Reducer processing RESET_GROUP_DOCS:' + JSON.stringify(action));
            return { ...state,  recordtype:action.recordtype, publicRecords:{}, error: null, loading: true };

        default:
        // console.log('PublicRecords Reducer default:' + JSON.stringify(action.type));
        // console.log('PublicRecords Reducer default state:' + JSON.stringify(state));
          return state;
}
}

import { EB2ServicesConstants } from '../../constants';

var INITIAL_STATE = { groupName:'', EB2Data:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('AgendasAndMinutes reducer processing:' + JSON.stringify(action));
    let error;
    switch(action.type) {
        case EB2ServicesConstants.FETCH_DATA:// start fetching docs and set loading = true
        // console.log('EB2Services Reducer - processing FETCH_DATA:' + JSON.stringify(action));
            return { ...state,  groupName:action.groupName, EB2Data:[], error: null, loading: true };
        case EB2ServicesConstants.FETCH_DATA_SUCCESS:// return list of posts and make loading = false
            // console.log('EB2Services Reducer - processing SUCCESS:' + JSON.stringify(action.groupName));
            return { ...state, groupName:action.groupName, EB2Data: action.payload, error:null, loading: false };
        default:
        // console.log('FAQData Reducer default:' + JSON.stringify(action.type));
        // console.log('PublicRecords Reducer default state:' + JSON.stringify(state));
          return state;
}
}

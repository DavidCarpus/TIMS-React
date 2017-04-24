import { FAQConstants } from '../../constants';

var INITIAL_STATE = { groupName:'', faqData:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('AgendasAndMinutes reducer processing:' + JSON.stringify(action));
    let error;
    switch(action.type) {
        case FAQConstants.FETCH_FAQ_DATA:// start fetching docs and set loading = true
        console.log('FAQData Reducer - processing FETCH_FAQ_DATA:' + JSON.stringify(action));
            return { ...state,  groupName:action.groupName, faqData:[], error: null, loading: true };
        case FAQConstants.FETCH_FAQ_DATA_SUCCESS:// return list of posts and make loading = false
            console.log('FAQData Reducer - processing SUCCESS:' + JSON.stringify(action.groupName));
            return { ...state, groupName:action.groupName, faqData: action.payload, error:null, loading: false };
        default:
        // console.log('FAQData Reducer default:' + JSON.stringify(action.type));
        // console.log('PublicRecords Reducer default state:' + JSON.stringify(state));
          return state;
}
}

import { PageAsidesConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'',PageAsides:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('MainMenuData reducer processing:' + JSON.stringify(action));
    // let error;
    switch(action.type) {
        case PageAsidesConstants.FETCH_PAGE_ASIDES_DATA:// start fetching docs and set loading = true
        // console.log('PageAsides Reducer - processing FETCH_PAGE_ASIDES_DATA:' + JSON.stringify(action));
            return { ...state,  PageAsides:[], error: null, loading: true };
        case PageAsidesConstants.FETCH_PAGE_ASIDES_DATA_SUCCESS:// return list of posts and make loading = false
            // console.log('PageAsides Reducer - processing SUCCESS:' + JSON.stringify(action.groupName));
            return { ...state, groupName: action.groupName , PageAsides: action.payload, error:null, loading: false };
        default:
        // console.log('PageAsides Reducer default:' + JSON.stringify(action.type));
        // console.log('PublicRecords Reducer default state:' + JSON.stringify(state));
          return state;
}
}

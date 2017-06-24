import { SystemIndexConstants } from '../../../constants';

var INITIAL_STATE = { links:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('MainMenuData reducer processing:' + JSON.stringify(action));
    // let error;
    switch(action.type) {
        case SystemIndexConstants.FETCH_DATA:// start fetching docs and set loading = true
        // console.log('SystemIndex Reducer - processing FETCH_DATA:' + JSON.stringify(action));
            return { ...state,  links:[], error: null, loading: true };
        case SystemIndexConstants.FETCH_DATA_SUCCESS:// return list of posts and make loading = false
        // console.log('SystemIndex Reducer - processing FETCH_DATA_SUCCESS:' + JSON.stringify(action));
            // console.log('PageAsides Reducer - processing SUCCESS:' + JSON.stringify(action.groupName));
            return { ...state,  links: action.payload, error:null, loading: false };
        default:
        // console.log('PageAsides Reducer default:' + JSON.stringify(action.type));
        // console.log('PublicRecords Reducer default state:' + JSON.stringify(state));
          return state;
}
}

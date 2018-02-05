import { StaticPageConstants } from '../../../constants';

var INITIAL_STATE = { StaticPage:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('MainMenuData reducer processing:' + JSON.stringify(action));
    // let error;
    switch(action.type) {
        case StaticPageConstants.FETCH_STATIC_PAGE_DATA:// start fetching docs and set loading = true
        // console.log('StaticPage Reducer - processing FETCH_STATIC_PAGE_DATA:' + JSON.stringify(action));
            return { ...state,  StaticPage:[], error: null, loading: true };
        case StaticPageConstants.FETCH_STATIC_PAGE_DATA_SUCCESS:// return list of posts and make loading = false
            return { ...state, StaticPage: action.payload, error:null, loading: false };
        default:
        // console.log('StaticPage Reducer default:' + JSON.stringify(action.type));
        // console.log('PublicRecords Reducer default state:' + JSON.stringify(state));
          return state;
}
}

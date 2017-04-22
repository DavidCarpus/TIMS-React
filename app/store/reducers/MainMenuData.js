import { MainMenuConstants } from '../../constants';

var INITIAL_STATE = { menus:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('MainMenuData reducer processing:' + JSON.stringify(action));
    let error;
    switch(action.type) {
        case MainMenuConstants.FETCH_MAIN_MENU_DATA:// start fetching docs and set loading = true
        // console.log('MainMenuData Reducer - processing FETCH_MAIN_MENU_DATA:' + JSON.stringify(action));
            return { ...state,  menus:[], error: null, loading: true };
        case MainMenuConstants.FETCH_MAIN_MENU_DATA_SUCCESS:// return list of posts and make loading = false
            // console.log('MainMenuData Reducer - processing SUCCESS:' + JSON.stringify(action.groupName));
            return { ...state, menus: action.payload, error:null, loading: false };
        default:
        // console.log('MainMenuData Reducer default:' + JSON.stringify(action.type));
        // console.log('PublicRecords Reducer default state:' + JSON.stringify(state));
          return state;
}
}

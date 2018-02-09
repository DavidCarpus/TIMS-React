import { MainMenuConstants } from '../../../constants';

var INITIAL_STATE = { menus:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case MainMenuConstants.FETCH_MAIN_MENU_DATA:
            return { ...state,  menus:[], error: null, loading: true };
        case MainMenuConstants.FETCH_MAIN_MENU_DATA_SUCCESS:
            return { ...state, menus: action.payload, error:null, loading: false };
        default:
          return state;
}
}

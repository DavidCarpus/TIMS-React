import { StaticPageConstants } from '../../../constants';

var INITIAL_STATE = { StaticPage:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case StaticPageConstants.FETCH_STATIC_PAGE_DATA:
            return { ...state,  StaticPage:[], error: null, loading: true };
        case StaticPageConstants.FETCH_STATIC_PAGE_DATA_SUCCESS:
            return { ...state, StaticPage: action.payload, error:null, loading: false };
        default:
          return state;
}
}

import { SystemIndexConstants } from '../../../constants';

var INITIAL_STATE = { links:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case SystemIndexConstants.FETCH_DATA:
            return { ...state,  links:[], error: null, loading: true };
        case SystemIndexConstants.FETCH_DATA_SUCCESS:
            return { ...state,  links: action.payload, error:null, loading: false };
        default:
          return state;
}
}

import { PageAsidesConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'',PageAsides:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case PageAsidesConstants.FETCH_PAGE_ASIDES_DATA:
            return { ...state,  PageAsides:[], error: null, loading: true };
        case PageAsidesConstants.FETCH_PAGE_ASIDES_DATA_SUCCESS:
            return { ...state, groupName: action.groupName , PageAsides: action.payload, error:null, loading: false };
        default:
          return state;
}
}

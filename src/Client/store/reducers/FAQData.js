import { FAQConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'', faqData:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case FAQConstants.FETCH_FAQ_DATA:
            return { ...state,  groupName:action.groupName, faqData:[], error: null, loading: true };
        case FAQConstants.FETCH_FAQ_DATA_SUCCESS:
            return { ...state, groupName:action.groupName, faqData: action.payload, error:null, loading: false };
        default:
          return state;
}
}

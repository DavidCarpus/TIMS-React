import { NewsRequestsConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'',NewsData:[], NewsDetails:{}, error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case NewsRequestsConstants.FETCH_LIST_DATA:
            return { ...state,  NewsData:[], error: null, loading: true };
        case NewsRequestsConstants.FETCH_LIST_DATA_SUCCESS:
            return { ...state, groupName: action.groupName , NewsData: action.payload, error:null, loading: false };
        case NewsRequestsConstants.FETCH_DATA_DETAILS:
            return { ...state,  NewsDetails:{}, error: null, loading: true };
        case NewsRequestsConstants.FETCH_DATA_DETAILS_SUCCESS:
            return { ...state, NewsDetails: action.payload, error:null, loading: false };
        default:
          return state;
}
}

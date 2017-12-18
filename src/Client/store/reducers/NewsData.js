import { NewsRequestsConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'',NewsData:[], NewsDetails:{}, error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('MainMenuData reducer processing:' + JSON.stringify(action));
    // let error;
    switch(action.type) {
        case NewsRequestsConstants.FETCH_LIST_DATA:// start fetching docs and set loading = true
            return { ...state,  NewsData:[], error: null, loading: true };
        case NewsRequestsConstants.FETCH_LIST_DATA_SUCCESS:// return list of posts and make loading = false
            return { ...state, groupName: action.groupName , NewsData: action.payload, error:null, loading: false };
        case NewsRequestsConstants.FETCH_DATA_DETAILS:// start fetching docs and set loading = true
            return { ...state,  NewsDetails:{}, error: null, loading: true };
        case NewsRequestsConstants.FETCH_DATA_DETAILS_SUCCESS:// return list of posts and make loading = false
            return { ...state, NewsDetails: action.payload, error:null, loading: false };
        default:
          return state;
}
}

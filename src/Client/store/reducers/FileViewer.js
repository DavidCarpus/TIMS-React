import { FileViewConstants } from '../../../constants';

var INITIAL_STATE = { error:null, loading: false, currentPage:1, totalPages:0 }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case FileViewConstants.FETCH:// start fetching docs and set loading = true
            return { ...state, error: null, loading: true };
        case FileViewConstants.FETCH_SUCCESS:// return list of posts and make loading = false
            return { ...state,  error:null, loading: false , ...action.payload };
        case FileViewConstants.FETCH_FAILURE:// return list of posts and make loading = false
            return { ...state,  error:action.payload, loading: false };
        case FileViewConstants.CURRENT_PAGE:// return list of posts and make loading = false
            return { ...state,  currentPage: action.currentPage };
        case FileViewConstants.TOTAL_PAGES:// return list of posts and make loading = false
            return { ...state,  totalPages: action.totalPages };

        default:
          return state;
}
}

import { PublicDocumentsConstants as constants } from '../../../constants';

var INITIAL_STATE = { recordtype:'', publicRecords:{}, filter:{}, error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case constants.FETCH_PUBLIC_DOCS:
            return { ...state,  recordtype:action.recordtype, publicRecords:{}, error: null, loading: true };
        case constants.FETCH_PUBLIC_DOCS_SUCCESS:
            return { ...state, recordtype:action.recordtype, publicRecords: action.payload, error:null, loading: false };
        case constants.RESET_GROUP_DOCS:
            return { ...state,  recordtype:action.recordtype, publicRecords:{}, error: null, loading: true };
        case constants.FILTER_EDIT:// get 'current' filter and modify it
            return { ...state, filter:Object.assign({},state.filter, {[action.field]:action.value}), error:null, loading: false };
        default:
          return state;
}
}

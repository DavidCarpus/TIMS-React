import { EB2ServicesConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'', EB2Data:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case EB2ServicesConstants.FETCH_DATA:
            return { ...state,  groupName:action.groupName, EB2Data:[], error: null, loading: true };
        case EB2ServicesConstants.FETCH_DATA_SUCCESS:
            return { ...state, groupName:action.groupName, EB2Data: action.payload, error:null, loading: false };
        default:
          return state;
}
}

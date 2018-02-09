import { SingleNoticeDataConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'', notice:{}, error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case SingleNoticeDataConstants.FETCH_DATA:
            return { ...state,  groupName:action.groupName, notice:{}, error: null, loading: true };
        case SingleNoticeDataConstants.FETCH_DATA_SUCCESS:
            return { ...state, groupName:action.groupName, notice: action.payload[0], error:null, loading: false };

        default:
          return state;
}
}

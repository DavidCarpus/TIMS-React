import { SingleNoticeDataConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'', notice:{}, error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case SingleNoticeDataConstants.FETCH_DATA:// start fetching docs and set loading = true
        // console.log('SingleNoticeData Reducer processing FETCH_DATA:' + JSON.stringify(action));
            return { ...state,  groupName:action.groupName, notice:{}, error: null, loading: true };
        case SingleNoticeDataConstants.FETCH_DATA_SUCCESS:// return list of posts and make loading = false
        console.log("action:", action);
            // if (! action.groupName) {
            //     // eslint-disable-next-line no-debugger
            //     debugger;
            // }
            // console.log('SingleNoticeData Reducer processing SUCCESS:' + JSON.stringify(action.groupName));
            return { ...state, groupName:action.groupName, notice: action.payload[0], error:null, loading: false };

        default:
        // console.log('SingleNoticeData Reducer default:' + JSON.stringify(action.type));
        // console.log('SingleNoticeData Reducer default state:' + JSON.stringify(state));
          return state;
}
}

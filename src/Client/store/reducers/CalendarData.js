import { CalendarDataConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'',CalendarData:[], error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('MainMenuData reducer processing:' + JSON.stringify(action));
    // let error;
    switch(action.type) {
        case CalendarDataConstants.FETCH_DATA:// start fetching docs and set loading = true
        // console.log('CalendarData Reducer - processing FETCH_DATA:' + JSON.stringify(action));
            return { ...state,  CalendarData:[], error: null, loading: true };
        case CalendarDataConstants.FETCH_DATA_SUCCESS:// return list of posts and make loading = false
            // console.log('CalendarData Reducer - processing SUCCESS:' + JSON.stringify(action.payload));
            return { ...state, groupName: action.groupName , CalendarData: action.payload, error:null, loading: false };
        default:
        // console.log('CalendarData Reducer default:' + JSON.stringify(action.type));
        // console.log('PublicRecords Reducer default state:' + JSON.stringify(state));
          return state;
}
}

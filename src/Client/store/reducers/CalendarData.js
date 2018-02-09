import { CalendarDataConstants } from '../../../constants';
import { getDisplayFiltersFromEvents,getInitialFilter } from '../../libs/CalendarData';

var INITIAL_STATE = { groupName:'',CalendarData:[], filter:getInitialFilter(),error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case CalendarDataConstants.FETCH_DATA:
            return { ...state,  CalendarData:[], error: null, loading: true };
        case CalendarDataConstants.FETCH_DATA_SUCCESS:// get 'default filter' and mod with current
            return { ...state, groupName: action.groupName , CalendarData: action.payload,
                filter: Object.assign({},getDisplayFiltersFromEvents(action.payload), state.filter),
                error:null, loading: false
            };
        case CalendarDataConstants.FILTER_EDIT:// get 'current' filter and modify it
            return { ...state, groupName: action.groupName ,
                filter:Object.assign({},state.filter, {[action.field]:action.value}),
                error:null, loading: false };
        default:
          return state;
}
}

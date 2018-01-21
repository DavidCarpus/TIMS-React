import {CalendarDataConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
// const actionsName='CalendarData';
//========================================
export function fetchCalendarData(year=(new Date()).getUTCFullYear(), month=(new Date()).getUTCMonth()) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}CalendarEvents/` + year + '/' + month,
  });
  // debugger

    return dispatch => {
        dispatch({type: CalendarDataConstants.FETCH_DATA});
        request.then( response => {
               dispatch(fetchCalendarDataSuccess(response.data));
          })
          .catch( reason => {
              dispatch(fetchCalendarDataFailure(reason));
          })

    }
}
//========================================
export function fetchCalendarDataSuccess( calendarData) {
    // console.log(actionsName + ' *** fetchMeetingsSuccess:'+ CalendarDataConstants.FETCH_DATA_SUCCESS + JSON.stringify(calendarData));
    const action =   {
    type: CalendarDataConstants.FETCH_DATA_SUCCESS,
    payload: calendarData,
  };
  return action;
}
//========================================
export function fetchCalendarDataFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: CalendarDataConstants.FETCH_DATA_FAILURE,
    payload: error
  };
}
//========================================
export function editCalendarFilter(newFilter,newValue) {
    // console.log('editCalendarFilter:',newFilter, newValue);
    return {
      type: CalendarDataConstants.FILTER_EDIT,
      field: newFilter,
      value: newValue
      // payload: {newFilter:newFilter,newValue:newValue}
      // payload: {field:field, event:event, newValue:newValue, previousValue:previousValue}
    };
}

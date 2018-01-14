import {CalendarDataConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
// const actionsName='CalendarData';
//========================================
export function fetchCalendarData() {
    // console.log(actionsName + ' fetchCalendarData');
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}CalendarEvents/`,
    });
    // console.log(actionsName +' fetchCalendarData'+JSON.stringify(`${ROOT_URL}CalendarEvents/`+ ));

    return dispatch => {
        dispatch({type: CalendarDataConstants.FETCH_DATA});
        request.then( response => {
            // console.log(actionsName + ' fetchCalendarData... success: '+JSON.stringify(response.data));
               dispatch(fetchCalendarDataSuccess(response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchCalendarData? : ' + JSON.stringify(reason));
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

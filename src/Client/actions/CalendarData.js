import {CalendarDataConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function fetchCalendarData(year=(new Date()).getUTCFullYear(), month=(new Date()).getUTCMonth()) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}CalendarEvents/` + year + '/' + month,
  });

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
    const action =   {
    type: CalendarDataConstants.FETCH_DATA_SUCCESS,
    payload: calendarData,
  };
  return action;
}
//========================================
export function fetchCalendarDataFailure(error) {
  return {
    type: CalendarDataConstants.FETCH_DATA_FAILURE,
    payload: error
  };
}
//========================================
export function editCalendarFilter(newFilter,newValue) {
    return {
      type: CalendarDataConstants.FILTER_EDIT,
      field: newFilter,
      value: newValue
    };
}

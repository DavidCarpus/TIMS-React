import {SingleNoticeDataConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
// const actionsName='SingleNotice';
//========================================
export function fetchSingleNotice(noticeID) {
    // console.log(actionsName + ' fetchSingleNotice');
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Notice/` + noticeID,
    });
    // console.log(actionsName +' fetchSingleNotice'+JSON.stringify(`${ROOT_URL}CalendarEvents/`+ ));

    return dispatch => {
        dispatch({type: SingleNoticeDataConstants.FETCH_DATA});
        request.then( response => {
            // console.log(actionsName + ' fetchSingleNotice... success: '+JSON.stringify(response.data));
               dispatch(fetchSingleNoticeSuccess(response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchSingleNotice? : ' + JSON.stringify(reason));
              dispatch(fetchSingleNoticeFailure(reason));
          })

    }
}
//========================================
export function fetchSingleNoticeSuccess( noticeData) {
    // console.log(actionsName + ' *** fetchSingleNoticeSuccess:'+ MainMenuConstants.FETCH_DATA_SUCCESS + JSON.stringify(noticeData));
    const action =   {
    type: SingleNoticeDataConstants.FETCH_DATA_SUCCESS,
    payload: noticeData,
  };
  return action;
}
//========================================
export function fetchSingleNoticeFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: SingleNoticeDataConstants.FETCH_DATA_FAILURE,
    payload: error
  };
}

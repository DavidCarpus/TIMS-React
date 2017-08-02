import {AlertRequestsDataConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
const actionsName='AlertRequests';
//========================================
export function pushAlertRequests(pushAlertData) {
    // console.log(actionsName + ' pushAlert');
    const request = axios({
      method: 'post',
      url: `${ROOT_URL}AlertRequests/`,
      data: pushAlertData
    });
    // console.log(actionsName +' pushAlert'+JSON.stringify(`${ROOT_URL}AlertRequests/`, request.data));

    return dispatch => {
        dispatch({type: AlertRequestsDataConstants.PUSH_DATA});
        request.then( response => {
            // console.log(actionsName + ' pushAlert... success: '+JSON.stringify(response.data));
               dispatch(pushAlertSuccess(response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' pushAlert? : ' + JSON.stringify(reason));
              dispatch(pushAlertFailure(reason));
          })
    }
}
//========================================
export function pushAlertSuccess( pushAlertResultsData) {
    console.log(actionsName + ' *** pushAlertSuccess:'+ JSON.stringify(pushAlertResultsData));
    const action =   {
    type: AlertRequestsDataConstants.PUSH_DATA_SUCCESS,
    payload: pushAlertResultsData,
  };
  return action;
}
//========================================
export function pushAlertFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: AlertRequestsDataConstants.PUSH_DATA_FAILURE,
    payload: error
  };
}

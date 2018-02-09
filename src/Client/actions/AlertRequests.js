import {AlertRequestsDataConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function pushAlertRequests(pushAlertData) {
    const request = axios({
      method: 'post',
      url: `${ROOT_URL}AlertRequests/`,
      data: pushAlertData
    });

    return dispatch => {
        dispatch({type: AlertRequestsDataConstants.PUSH_DATA});
        request.then( response => {
               dispatch(pushAlertSuccess(response.data));
          })
          .catch( reason => {
              dispatch(pushAlertFailure(reason));
          })
    }
}
//========================================
export function pushAlertSuccess( pushAlertResultsData) {
    const action =   {
    type: AlertRequestsDataConstants.PUSH_DATA_SUCCESS,
    payload: pushAlertResultsData,
  };
  return action;
}
//========================================
export function pushAlertFailure(error) {
  return {
    type: AlertRequestsDataConstants.PUSH_DATA_FAILURE,
    payload: error
  };
}

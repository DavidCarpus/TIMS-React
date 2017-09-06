import {AuthenticationConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
const actionsName='AuthenticationRequests';
//========================================
export function authenticationRequest(authenticationRequestsData) {
    // console.log(actionsName + ' authenticationRequests');
    const request = axios({
      method: 'post',
      url: `${ROOT_URL}auth/signin/`,
      data: authenticationRequestsData
    });
    // console.log(actionsName +' authenticationRequests'+JSON.stringify(`${ROOT_URL}AlertRequests/`, request.data));

    return dispatch => {
        dispatch({type: AuthenticationConstants.PUSH_DATA});
        request.then( response => {
            // console.log(actionsName + ' authenticationRequests... success: '+JSON.stringify(response));
               dispatch(authenticationRequestsSuccess(response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' authenticationRequests? : ' + JSON.stringify(reason));
              dispatch(authenticationRequestsFailure(reason.response.data));
          })
    }
}
//========================================
export function authenticationRequestsSuccess( authenticationRequestsResultsData) {
    // console.log(actionsName + ' *** authenticationRequestsSuccess:'+ JSON.stringify(authenticationRequestsResultsData));
    const action =   {
    type: AuthenticationConstants.PUSH_DATA_SUCCESS,
    payload: authenticationRequestsResultsData,
  };
  return action;
}
//========================================
export function authenticationRequestsFailure(error) {
    console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: AuthenticationConstants.PUSH_DATA_FAILURE,
    payload: error
  };
}

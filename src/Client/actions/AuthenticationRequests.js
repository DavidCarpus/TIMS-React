import {AuthenticationConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function authenticationRequest(authenticationRequestsData) {
    const request = axios({
      method: 'post',
      url: `${ROOT_URL}auth/signin/`,
      data: authenticationRequestsData
    });

    return dispatch => {
        dispatch({type: AuthenticationConstants.PUSH_DATA});
        request.then( response => {
               dispatch(authenticationRequestsSuccess(response.data));
          })
          .catch( reason => {
              if (reason.response) {
                  dispatch(authenticationRequestsFailure(reason.response.data));
              } else {
                  dispatch(authenticationRequestsFailure("No response from server."));
              }
          })
    }
}
//========================================
export function authenticationRequestsSuccess( authenticationRequestsResultsData) {
    const action =   {
    type: AuthenticationConstants.PUSH_DATA_SUCCESS,
    payload: authenticationRequestsResultsData,
  };
  return action;
}
//========================================
export function authenticationRequestsFailure(error) {
  return {
    type: AuthenticationConstants.PUSH_DATA_FAILURE,
    payload: error
  };
}

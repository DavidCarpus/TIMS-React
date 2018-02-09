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
        request.then( response => { dispatch(authenticationRequestsSuccess(response.data)); })
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
const authenticationRequestsSuccess = (authenticationRequestsResultsData)  => ({
    type: AuthenticationConstants.PUSH_DATA_SUCCESS,
    payload: authenticationRequestsResultsData,
})
//========================================
const authenticationRequestsFailure = (error)  => ({
    type: AuthenticationConstants.PUSH_DATA_FAILURE,
    payload: error
})

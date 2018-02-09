import {SubmitChangeConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function submitChangeRequest(submitChangeRequestsData) {
    var body = new FormData();
    Object.keys(submitChangeRequestsData).forEach(( key ) => {
        if (key === 'file') {
            body.append(key, submitChangeRequestsData[ key ][0]);
        }
        else {
            body.append(key, submitChangeRequestsData[ key ]);
        }

    });

    const req= {
        method: 'post',
        url: `${ROOT_URL}auth/changeRequest/`,
        data: body
    };
    const request = axios(req);

    return dispatch => {
        dispatch({type: SubmitChangeConstants.PUSH_DATA});
        request.then( response => {
               dispatch(submitChangeRequestsSuccess(response.data));
          })
          .catch( reason => {
            if (reason.response) {
                dispatch(submitChangeRequestsFailure(reason.response.data));
            } else {
                dispatch(submitChangeRequestsFailure("No response from server."));
            }

          })
    }
}
//========================================
export function submitChangeRequestsSuccess( submitChangeRequestsResultsData) {
    const action =   {
    type: SubmitChangeConstants.PUSH_DATA_SUCCESS,
    payload: submitChangeRequestsResultsData,
  };
  return action;
}
//========================================
export function submitChangeRequestsFailure(error) {
  return {
    type: SubmitChangeConstants.PUSH_DATA_FAILURE,
    payload: error
  };
}

import {SubmitChangeConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
const actionsName='AuthenticationRequests';
//========================================
export function submitChangeRequest(submitChangeRequestsData) {

    var body = new FormData();
    Object.keys(submitChangeRequestsData).forEach(( key ) => {
        // console.log('body.append:', key, JSON.stringify(submitChangeRequestsData[ key ]));
        if (key === 'file') {
            body.append(key, submitChangeRequestsData[ key ][0]);
        }
        else {
            body.append(key, submitChangeRequestsData[ key ]);
        }

    });
    // console.log('onChangesSubmit:body:', body);

    // var axiosConfig = {
    //   onUploadProgress: function(progressEvent) {
    //     var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
    //     console.log('percentCompleted:', percentCompleted);
    //   }
    // };
    // console.log(actionsName + ' submitChangeRequests', Object.keys(submitChangeRequestsData));
    const req= {
        method: 'post',
        url: `${ROOT_URL}auth/changeRequest/`,
        data: body
    };
    // const request = axios.post(`${ROOT_URL}auth/changeRequest/`, body, axiosConfig);

    const request = axios(req);
    console.log(actionsName +' submitChangeRequests',req);
    console.log( JSON.stringify(submitChangeRequestsData));


    return dispatch => {
        dispatch({type: SubmitChangeConstants.PUSH_DATA});
        request.then( response => {
            // console.log(actionsName + ' submitChangeRequests... success: '+JSON.stringify(response));
               dispatch(submitChangeRequestsSuccess(response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' submitChangeRequests? : ' + JSON.stringify(reason));
              dispatch(submitChangeRequestsFailure(reason.response.data));
          })
    }
}
//========================================
export function submitChangeRequestsSuccess( submitChangeRequestsResultsData) {
    console.log(actionsName + ' *** submitChangeRequestsSuccess:'+ JSON.stringify(submitChangeRequestsResultsData));
    const action =   {
    type: SubmitChangeConstants.PUSH_DATA_SUCCESS,
    payload: submitChangeRequestsResultsData,
  };
  return action;
}
//========================================
export function submitChangeRequestsFailure(error) {
    console.log(actionsName + 'submitChangeRequestsFailure:'+JSON.stringify(error));
  return {
    type: SubmitChangeConstants.PUSH_DATA_FAILURE,
    payload: error
  };
}

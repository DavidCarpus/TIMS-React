import {SystemIndexConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
// const actionsName='SystemIndex';
//========================================
export function fetchSystemIndex() {
    // console.log(actionsName + ' fetchSystemIndex');
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Links/`,
    });
    // console.log(actionsName +' fetchSystemIndex'+JSON.stringify(`${ROOT_URL}Asides/`));

    return dispatch => {
        dispatch({type: SystemIndexConstants.FETCH_DATA});
        request.then( response => {
            // console.log(actionsName + ' fetchSystemIndex... success: '+JSON.stringify(response.data));
               dispatch(fetchSystemIndexSuccess(response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchSystemIndex? : ' + JSON.stringify(reason));
              dispatch(fetchSystemIndexFailure(reason));
          })

    }
}
//========================================
export function fetchSystemIndexSuccess( asides) {
    // console.log(actionsName + ' *** fetchMeetingsSuccess:'+ SystemIndexConstants.FETCH_DATA_SUCCESS + JSON.stringify(asides));
    const action =   {
    type: SystemIndexConstants.FETCH_DATA_SUCCESS,
    payload: asides,
  };
  return action;
}
//========================================
export function fetchSystemIndexFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: SystemIndexConstants.FETCH_DATA_FAILURE,
    payload: error
  };
}

import {EB2ServicesConstants} from '../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
const actionsName='EB2ServicesData';
//========================================
export function fetchEB2ServicesData(groupName) {
    // console.log(actionsName + ' fetchEB2ServicesData:'+JSON.stringify(groupName));
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}EB2Services/`+ groupName,
    });
    // console.log(actionsName +' fetching : '+JSON.stringify(`${ROOT_URL}EB2Services/`+ groupName));
    // console.log(JSON.stringify(EB2ServicesConstants));

    return dispatch => {
        dispatch({type: EB2ServicesConstants.FETCH_DATA, groupName: groupName});
        request.then( response => {
               dispatch(fetchEB2ServicesDataSuccess(groupName, response.data));
            //    console.log(actionsName + ' fetchEB2ServicesData... success: ');
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchEB2ServicesData? : ' + JSON.stringify(reason));
              dispatch(fetchEB2ServicesDataFailure(reason));
          })

    }
}
//========================================
export function fetchEB2ServicesDataSuccess(groupName, meetingDocs) {
    const action =   {
    type: EB2ServicesConstants.FETCH_DATA_SUCCESS,
    payload: meetingDocs,
    groupName: groupName
  };
  // console.log(actionsName + 'fetchSuccess:'+JSON.stringify(action.groupName));
  return action;
}
//========================================
export function fetchEB2ServicesDataFailure(error) {
    // console.log(actionsName + 'fetchFailure:'+JSON.stringify(error));
  return {
    type: EB2ServicesConstants.FETCH_DATA_FAILURE,
    payload: error
  };
}

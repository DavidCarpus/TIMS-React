import {FAQConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
const actionsName='FAQData';
//========================================
export function fetchFAQData(groupName) {
    console.log(actionsName + ' fetchFAQData:'+JSON.stringify(groupName));
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}FAQ/`+ groupName,
    });
    console.log(actionsName +' fetchMeetings'+JSON.stringify(`${ROOT_URL}FAQ/`+ groupName));

    return dispatch => {
        dispatch({type: FAQConstants.FETCH_FAQ_DATA, groupName: groupName});
        request.then( response => {
               dispatch(fetchFAQDataSuccess(groupName, response.data));
            //    console.log(actionsName + ' fetchFAQData... success: ');
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchFAQData? : ' + JSON.stringify(reason));
              dispatch(fetchFAQDataFailure(reason));
          })

    }
}
//========================================
export function fetchFAQDataSuccess(groupName, meetingDocs) {
    const action =   {
    type: FAQConstants.FETCH_FAQ_DATA_SUCCESS,
    payload: meetingDocs,
    groupName: groupName
  };
  // console.log(actionsName + 'fetchMeetingsSuccess:'+JSON.stringify(action.groupName));
  return action;
}
//========================================
export function fetchFAQDataFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: FAQConstants.FETCH_FAQ_DATA_FAILURE,
    payload: error
  };
}

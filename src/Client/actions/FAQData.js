import {FAQConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function fetchFAQData(groupName) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}FAQ/`+ groupName,
    });

    return dispatch => {
        dispatch({type: FAQConstants.FETCH_FAQ_DATA, groupName: groupName});
        request.then( response => {
               dispatch(fetchFAQDataSuccess(groupName, response.data));
          })
          .catch( reason => {
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
  return action;
}
//========================================
export function fetchFAQDataFailure(error) {
  return {
    type: FAQConstants.FETCH_FAQ_DATA_FAILURE,
    payload: error
  };
}

import {NewsRequestsConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
// const actionsName='News';
//========================================
export function fetchNewsList(groupName) {
    // console.log(actionsName + ' fetchNewsList');
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/News/`+ groupName,
    });
    // console.log(actionsName +' fetchNewsList'+JSON.stringify(`${ROOT_URL}Asides/`+ groupName));

    return dispatch => {
        dispatch({type: NewsRequestsConstants.FETCH_LIST_DATA});
        request.then( response => {
            // console.log(actionsName + ' fetchNewsList... success: '+JSON.stringify(response.data));
               dispatch(fetchNewsListSuccess(groupName,response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchNewsList? : ' + JSON.stringify(reason));
              dispatch(fetchNewsListFailure(reason));
          })

    }
}
//========================================
export function fetchNewsListSuccess(groupName, records) {
    // console.log(actionsName + ' *** fetchMeetingsSuccess:'+ NewsRequestsConstants.FETCH_LIST_DATA_SUCCESS + JSON.stringify(records));
    const action =   {
    type: NewsRequestsConstants.FETCH_LIST_DATA_SUCCESS,
    payload: records,
    groupName: groupName,
  };
  return action;
}
//========================================
export function fetchNewsListFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: NewsRequestsConstants.FETCH_LIST_DATA_FAILURE,
    payload: error
  };
}
//========================================
//========================================
//========================================
export function fetchNewsDetails(id) {
    // console.log(actionsName + ' fetchNewsDetails');
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/NewsDetails/`+ id,
    });
    // console.log(actionsName +' fetchNewsDetails'+JSON.stringify(`${ROOT_URL}Records/News/`+ id));

    return dispatch => {
        dispatch({type: NewsRequestsConstants.FETCH_DATA_DETAILS});
        request.then( response => {
            // console.log(actionsName + ' fetchNewsDetails... success: '+JSON.stringify(response.data));
               dispatch(fetchNewsDetailsSuccess(id,response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchNewsDetails? : ' + JSON.stringify(reason));
              dispatch(fetchNewsDetailsFailure(reason));
          })

    }
}
//========================================
export function fetchNewsDetailsSuccess(id, records) {
    // console.log(actionsName + ' *** fetchNewsDetailsSuccess:'+ NewsRequestsConstants.FETCH_DATA_DETAILS_SUCCESS + JSON.stringify(records));
    const action =   {
    type: NewsRequestsConstants.FETCH_DATA_DETAILS_SUCCESS,
    payload: records,
    id: id,
  };
  return action;
}
//========================================
export function fetchNewsDetailsFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: NewsRequestsConstants.FETCH_DATA_DETAILS_FAILURE,
    payload: error
  };
}

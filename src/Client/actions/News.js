import {NewsRequestsConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function fetchNewsList(groupName) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/News/`+ groupName,
    });

    return dispatch => {
        dispatch({type: NewsRequestsConstants.FETCH_LIST_DATA});
        request.then( response => {
               dispatch(fetchNewsListSuccess(groupName,response.data));
          })
          .catch( reason => dispatch(fetchNewsListFailure(reason)))
    }
}
//========================================
export function fetchNewsListSuccess(groupName, records) {
  return {
    type: NewsRequestsConstants.FETCH_LIST_DATA_SUCCESS,
    payload: records,
    groupName: groupName,
  };
}
//========================================
export function fetchNewsListFailure(error) {
  return {
    type: NewsRequestsConstants.FETCH_LIST_DATA_FAILURE,
    payload: error
  };
}
//========================================
//========================================
//========================================
export function fetchNewsDetails(id) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/NewsDetails/`+ id,
    });

    return dispatch => {
        dispatch({type: NewsRequestsConstants.FETCH_DATA_DETAILS});
        request.then( response => {
               dispatch(fetchNewsDetailsSuccess(id,response.data));
          })
          .catch( reason => dispatch(fetchNewsDetailsFailure(reason)))
    }
}
//========================================
export function fetchNewsDetailsSuccess(id, records) {
  return {
    type: NewsRequestsConstants.FETCH_DATA_DETAILS_SUCCESS,
    payload: records,
    id: id,
  };
}
//========================================
export function fetchNewsDetailsFailure(error) {
  return {
    type: NewsRequestsConstants.FETCH_DATA_DETAILS_FAILURE,
    payload: error
  };
}

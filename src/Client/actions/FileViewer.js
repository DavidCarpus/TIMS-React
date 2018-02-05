import {FileViewConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function setTotalPages(totalPages) {
    return dispatch => {
        dispatch({type: FileViewConstants.TOTAL_PAGES, totalPages: totalPages});
    }
}
export function setCurrentPage(currentPage) {
    return dispatch => {
        dispatch({type: FileViewConstants.CURRENT_PAGE, currentPage: currentPage});
    }
}
//========================================
export function fetchFileToView(fileID) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}ViewFile/${fileID}`,
    });

    return dispatch => {
        dispatch({type: FileViewConstants.FETCH});
        request.then( response => {
               dispatch(fetchFileToViewSuccess(response.data));
          })
          .catch( reason => {
              dispatch(fetchFileToViewFailure(reason));
          })
    }
}
//========================================
const fetchFileToViewSuccess= (pageData) => ({
        type: FileViewConstants.FETCH_SUCCESS,
        payload: pageData,
    })
//========================================
function fetchFileToViewFailure(error) {
    console.log('FAILURE:' + JSON.stringify(error));
  return {
    type: FileViewConstants.FETCH_FAILURE,
    payload: error
  };
}

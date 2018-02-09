import {SingleNoticeDataConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function fetchSingleNotice(noticeID) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Notice/` + noticeID,
    });

    return dispatch => {
        dispatch({type: SingleNoticeDataConstants.FETCH_DATA});
        request.then( response => dispatch(fetchSingleNoticeSuccess(response.data)) )
        .catch( reason =>  dispatch(fetchSingleNoticeFailure(reason)) )
    }
}
//========================================
const fetchSingleNoticeSuccess = (noticeData)  => ({
    type: SingleNoticeDataConstants.FETCH_DATA_SUCCESS,
    payload: noticeData,
})
//========================================
const fetchSingleNoticeFailure = (error) => ({
    type: SingleNoticeDataConstants.FETCH_DATA_FAILURE,
    payload: error
})

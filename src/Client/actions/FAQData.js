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
        request.then( response => dispatch(fetchFAQDataSuccess(groupName, response.data)) )
        .catch( reason => dispatch(fetchFAQDataFailure(reason)) )
    }
}
//========================================
const fetchFAQDataSuccess = (groupName, meetingDocs)  => ({
        type: FAQConstants.FETCH_FAQ_DATA_SUCCESS,
        payload: meetingDocs,
        groupName: groupName
    })
//========================================
const fetchFAQDataFailure = (error)  => ({
    type: FAQConstants.FETCH_FAQ_DATA_FAILURE,
    payload: error
})

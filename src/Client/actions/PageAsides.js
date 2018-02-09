import {PageAsidesConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function fetchPageAsides(groupName) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Asides/`+ groupName,
    });

    return dispatch => {
        dispatch({type: PageAsidesConstants.FETCH_PAGE_ASIDES_DATA});
        request.then( response =>  dispatch(fetchPageAsidesSuccess(groupName,response.data)) )
        .catch( reason => dispatch(fetchPageAsidesFailure(reason)) )
    }
}
//========================================
const fetchPageAsidesSuccess = (groupName, asides) => ({
    type: PageAsidesConstants.FETCH_PAGE_ASIDES_DATA_SUCCESS,
    payload: asides,
    groupName: groupName,
})
//========================================
const fetchPageAsidesFailure = (error) => ({
    type: PageAsidesConstants.FETCH_PAGE_ASIDES_DATA_FAILURE,
    payload: error
})

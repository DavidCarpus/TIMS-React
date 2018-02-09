import {StaticPageConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function fetchStaticPage(pageURI) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}PublicRecordPage/`+ pageURI,
    });

    return dispatch => {
        dispatch({type: StaticPageConstants.FETCH_STATIC_PAGE_DATA});
        request.then( response => dispatch(fetchStaticPageSuccess(response.data)) )
        .catch( reason => dispatch(fetchStaticPageFailure(reason)) )
    }
}
//========================================
const fetchStaticPageSuccess = (pageData)  => ({
    type: StaticPageConstants.FETCH_STATIC_PAGE_DATA_SUCCESS,
    payload: pageData,
})
//========================================
const fetchStaticPageFailure = (error) => ({
    type: StaticPageConstants.FETCH_STATIC_PAGE_DATA_FAILURE,
    payload: error
})

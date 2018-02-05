import {StaticPageConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
// const actionsName='StaticPage';
//========================================
export function fetchStaticPage(pageURI) {
    // console.log(actionsName + ' fetchStaticPage');
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}PublicRecordPage/`+ pageURI,
    });

    return dispatch => {
        dispatch({type: StaticPageConstants.FETCH_STATIC_PAGE_DATA});
        request.then( response => {
            // console.log(actionsName + ' fetchStaticPage... success: '+JSON.stringify(response.data));
               dispatch(fetchStaticPageSuccess(response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchStaticPage? : ' + JSON.stringify(reason));
              dispatch(fetchStaticPageFailure(reason));
          })

    }
}
//========================================
export function fetchStaticPageSuccess(pageData) {
    // console.log(actionsName + ' *** fetchMeetingsSuccess:'+ StaticPageConstants.FETCH_STATIC_PAGE_DATA_SUCCESS + JSON.stringify(pageData));
    const action =   {
    type: StaticPageConstants.FETCH_STATIC_PAGE_DATA_SUCCESS,
    payload: pageData,
  };
  return action;
}
//========================================
export function fetchStaticPageFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: StaticPageConstants.FETCH_STATIC_PAGE_DATA_FAILURE,
    payload: error
  };
}

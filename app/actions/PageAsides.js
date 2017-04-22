import {PageAsidesConstants} from '../constants'
import axios from 'axios';

// const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : 'http://www.carpusconsulting.com/milton/api/';
const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : './api/';
// const ROOT_URL = 'http://carpusconsulting.com/milton/api/';
const actionsName='PageAsides';
// console.log('MainMenuData ROOT_URL:' + ROOT_URL);

//========================================
export function fetchPageAsides(groupName) {
    // console.log(actionsName + ' fetchPageAsides');
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Asides/`+ groupName,
    });
    // console.log(actionsName +' fetchPageAsides'+JSON.stringify(`${ROOT_URL}Asides/`+ groupName));

    // dispatch({type: MainMenuConstants.FETCH_PAGE_ASIDES_DATA});
    return dispatch => {
        request.then( response => {
            // console.log(actionsName + ' fetchPageAsides... success: '+JSON.stringify(response.data));
               dispatch(fetchPageAsidesSuccess(groupName,response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchPageAsides? : ' + JSON.stringify(reason));
              dispatch(fetchPageAsidesFailure(reason));
          })

    }
}
//========================================
export function fetchPageAsidesSuccess(groupName, asides) {
    // console.log(actionsName + ' *** fetchMeetingsSuccess:'+ MainMenuConstants.FETCH_PAGE_ASIDES_DATA_SUCCESS + JSON.stringify(asides));
    const action =   {
    type: PageAsidesConstants.FETCH_PAGE_ASIDES_DATA_SUCCESS,
    payload: asides,
    groupName: groupName,
  };
  return action;
}
//========================================
export function fetchPageAsidesFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: PageAsidesConstants.FETCH_PAGE_ASIDES_DATA_FAILURE,
    payload: error
  };
}

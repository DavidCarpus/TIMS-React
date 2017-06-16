import {PageAsidesConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
// const actionsName='PageAsides';
//========================================
export function fetchPageAsides(groupName) {
    // console.log(actionsName + ' fetchPageAsides');
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Asides/`+ groupName,
    });
    // console.log(actionsName +' fetchPageAsides'+JSON.stringify(`${ROOT_URL}Asides/`+ groupName));

    return dispatch => {
        dispatch({type: PageAsidesConstants.FETCH_PAGE_ASIDES_DATA});
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

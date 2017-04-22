import {MainMenuConstants} from '../constants'
import axios from 'axios';

// const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : 'http://www.carpusconsulting.com/milton/api/';
const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : './api/';
// const ROOT_URL = 'http://carpusconsulting.com/milton/api/';
const actionsName='MainMenuData';
// console.log('MainMenuData ROOT_URL:' + ROOT_URL);

//========================================
export function fetchMainMenuData() {
    // console.log(actionsName + ' fetchMainMenuData');
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Menus/`,
    });
    // console.log(actionsName +' fetchMainMenuData'+JSON.stringify(`${ROOT_URL}Menus/`));

    // dispatch({type: MainMenuConstants.FETCH_MAIN_MENU_DATA});
    return dispatch => {
        request.then( response => {
            // console.log(actionsName + ' fetchMainMenuData... success: '+JSON.stringify(response.data));
               dispatch(fetchMainMenuDataSuccess(response.data));
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchMainMenuData? : ' + JSON.stringify(reason));
              dispatch(fetchMainMenuDataFailure(reason));
          })

    }
}
//========================================
export function fetchMainMenuDataSuccess(menus) {
    // console.log(actionsName + ' *** fetchMeetingsSuccess:'+ MainMenuConstants.FETCH_MAIN_MENU_DATA_SUCCESS + JSON.stringify(menus));
    const action =   {
    type: MainMenuConstants.FETCH_MAIN_MENU_DATA_SUCCESS,
    payload: menus,
  };
  return action;
}
//========================================
export function fetchMainMenuDataFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: MainMenuConstants.FETCH_MAIN_MENU_DATA_FAILURE,
    payload: error
  };
}

import {MainMenuConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
// const actionsName='MainMenuData';
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

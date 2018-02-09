import {MainMenuConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function fetchMainMenuData() {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Menus/`,
    });

    return dispatch => {
        request.then( response => {
               dispatch(fetchMainMenuDataSuccess(response.data));
          })
          .catch( reason => {
              dispatch(fetchMainMenuDataFailure(reason));
          })
    }
}
//========================================
export function fetchMainMenuDataSuccess(menus) {
    const action =   {
    type: MainMenuConstants.FETCH_MAIN_MENU_DATA_SUCCESS,
    payload: menus,
  };
  return action;
}
//========================================
export function fetchMainMenuDataFailure(error) {
  return {
    type: MainMenuConstants.FETCH_MAIN_MENU_DATA_FAILURE,
    payload: error
  };
}

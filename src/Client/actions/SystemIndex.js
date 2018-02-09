import {SystemIndexConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function fetchSystemIndex() {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Links/`,
    });

    return dispatch => {
        dispatch({type: SystemIndexConstants.FETCH_DATA});
        request.then( response => dispatch(fetchSystemIndexSuccess(response.data)) )
        .catch( reason => dispatch(fetchSystemIndexFailure(reason)) )
    }
}
//========================================
const fetchSystemIndexSuccess = ( asides)  => ({
    type: SystemIndexConstants.FETCH_DATA_SUCCESS,
    payload: asides,
})
//========================================
const fetchSystemIndexFailure = (error) => ({
    type: SystemIndexConstants.FETCH_DATA_FAILURE,
    payload: error
})

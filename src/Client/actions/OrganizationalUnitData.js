import {OrganizationalUnitConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function fetchOrganizationalUnitData(groupName) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}GroupData/`+ groupName,
    });

    return dispatch => {
        dispatch({type: OrganizationalUnitConstants.FETCH_OU_DATA, groupName: groupName});
        request.then( response => dispatch(fetchOrganizationalUnitDataSuccess(groupName, response.data)) )
        .catch( reason => dispatch(fetchOrganizationalUnitDataFailure(reason)) )
    }
}
//========================================
const fetchOrganizationalUnitDataSuccess=(groupName, meetingDocs)  => ({
    type: OrganizationalUnitConstants.FETCH_OU_DATA_SUCCESS,
    payload: meetingDocs,
    groupName: groupName
})
//========================================
const fetchOrganizationalUnitDataFailure = (error) => ({
    type: OrganizationalUnitConstants.FETCH_OU_DATA_FAILURE,
    payload: error
})

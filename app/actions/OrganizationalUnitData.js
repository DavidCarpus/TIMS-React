import {OrganizationalUnitConstants} from '../constants'
import axios from 'axios';

// const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : 'http://www.carpusconsulting.com/milton/api/';
const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : './api/';
// const ROOT_URL = 'http://carpusconsulting.com/milton/api/';
const actionsName='OrganizationalUnitData';
// console.log('OrganizationalUnit ROOT_URL:' + ROOT_URL);

//========================================
export function fetchOrganizationalUnitData(groupName) {
    // console.log(actionsName + ' fetchOrganizationalUnitData:'+JSON.stringify(groupName));
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}GroupData/`+ groupName,
    });
    // console.log(actionsName +' fetchMeetings'+JSON.stringify(`${ROOT_URL}GroupData/`+ groupName));

    return dispatch => {
        dispatch({type: OrganizationalUnitConstants.FETCH_OU_DATA, groupName: groupName});
        request.then( response => {
               dispatch(fetchOrganizationalUnitDataSuccess(groupName, response.data));
            //    console.log(actionsName + ' fetchOrganizationalUnitData... success: ');
          })
          .catch( reason => {
            //   console.log(actionsName + ' fetchOrganizationalUnitData? : ' + JSON.stringify(reason));
              dispatch(fetchOrganizationalUnitDataFailure(reason));
          })

    }
}
//========================================
export function fetchOrganizationalUnitDataSuccess(groupName, meetingDocs) {
    const action =   {
    type: OrganizationalUnitConstants.FETCH_OU_DATA_SUCCESS,
    payload: meetingDocs,
    groupName: groupName
  };
  // console.log(actionsName + 'fetchMeetingsSuccess:'+JSON.stringify(action.groupName));
  return action;
}
//========================================
export function fetchOrganizationalUnitDataFailure(error) {
    // console.log(actionsName + 'fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: OrganizationalUnitConstants.FETCH_OU_DATA_FAILURE,
    payload: error
  };
}

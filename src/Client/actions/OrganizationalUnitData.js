import {OrganizationalUnitConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
// const actionsName='OrganizationalUnitData';
//========================================
export function fetchOrganizationalUnitData(groupName) {
    // console.log(actionsName + ' fetchOrganizationalUnitData:'+JSON.stringify(groupName));
    // groupName = (groupName == 'TransferRules')? 'PublicWorks' : groupName;
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
              if (process.env.NODE_ENV === 'development') {
                  debugger; // eslint-disable-line no-debugger
              }
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

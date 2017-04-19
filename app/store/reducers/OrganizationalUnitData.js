import { OrganizationalUnitConstants } from '../../constants';

var INITIAL_STATE = { groupName:'', groupData:{}, error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    // console.log('AgendasAndMinutes reducer processing:' + JSON.stringify(action));
    let error;
    switch(action.type) {
        case OrganizationalUnitConstants.FETCH_OU_DATA:// start fetching docs and set loading = true
        // console.log('OrganizationalUnitData Reducer - processing FETCH_OU_DATA:' + JSON.stringify(action));
            return { ...state,  groupName:action.groupName, groupData:{}, error: null, loading: true };
        case OrganizationalUnitConstants.FETCH_OU_DATA_SUCCESS:// return list of posts and make loading = false
            // console.log('OrganizationalUnitData Reducer - processing SUCCESS:' + JSON.stringify(action.groupName));
            return { ...state, groupName:action.groupName, groupData: action.payload, error:null, loading: false };
        default:
        // console.log('OrganizationalUnitData Reducer default:' + JSON.stringify(action.type));
        // console.log('PublicRecords Reducer default state:' + JSON.stringify(state));
          return state;
}
}

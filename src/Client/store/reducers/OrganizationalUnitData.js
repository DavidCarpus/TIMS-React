import { OrganizationalUnitConstants } from '../../../constants';

var INITIAL_STATE = { groupName:'', groupData:{}, error:null, loading: false }

export default function(state = INITIAL_STATE, action) {
    switch(action.type) {
        case OrganizationalUnitConstants.FETCH_OU_DATA:
            return { ...state,  groupName:action.groupName, groupData:{}, error: null, loading: true };
        case OrganizationalUnitConstants.FETCH_OU_DATA_SUCCESS:
            return { ...state, groupName:action.groupName, groupData: action.payload, error:null, loading: false };
        case OrganizationalUnitConstants.FETCH_OU_DATA_FAILURE:
            // // eslint-disable-next-line no-debugger
            // debugger;
            return { ...state, groupName:action.groupName, groupData: action.payload, error:null, loading: false };

        default:
          return state;
}
}

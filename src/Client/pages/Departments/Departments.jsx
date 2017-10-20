import { connect } from 'react-redux'
import DepartmentsUI from './DepartmentsUI'

import {documentsByYear} from '../../libs/AgendasAndMinutes'

import { fetchOrganizationalUnitData } from '../../actions/OrganizationalUnitData'
import { fetchPageAsides } from '../../actions/PageAsides'
import {fetchGroupNotices} from '../../actions/PublicDocuments'
import {fetchGroupDoc} from '../../actions/PublicDocuments'
import {fetchMeetingDocs} from '../../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {
    var groupName=  ownProps.match.params.department;
    let recordState = state.OrganizationalUnits;
    let loading= recordState.loading

    if (groupName === 'TransferRules') {
        groupName = 'PublicWorks'
    }
    let loadedGroupName = recordState.groupName
    let selectedGroupName = ownProps.groupName

    loading=recordState.loading;

    if (ownProps.store && loadedGroupName !== selectedGroupName && !recordState.loading) {
        // console.log('DepartmentsUI:recordState:', recordState);
        // Check if last group loaded was not in 'Department' mainMenu, do NOT load here. Will do it in componentWillMount
        if (state.MainMenus && state.MainMenus.menus && Object.keys(state.MainMenus.menus).length > 0 ) {
            let deptMenu = state.MainMenus.menus['/Departments']
            let newGroup = deptMenu.menus
            .filter(menu =>  (menu.pageLink === '/'+selectedGroupName) )

            let oldGroup = deptMenu.menus
            .filter(menu =>  (menu.pageLink === '/'+loadedGroupName) )

            // new group and old group both in 'Departments', fetch from here (otherwise do in componentWillMount )
            if ( newGroup.length > 0 && oldGroup.length >  0) {
                ownProps.store.dispatch(fetchOrganizationalUnitData(groupName))
                ownProps.store.dispatch(fetchPageAsides(groupName));
                ownProps.store.dispatch(fetchGroupNotices(groupName));
                ownProps.store.dispatch(fetchGroupDoc(groupName));
                ownProps.store.dispatch(fetchMeetingDocs(groupName));

                loading= true;
            }
        }
    }


    return {
        groupName:  groupName,
        groupData:  recordState.groupData,
        groupDocuments: state.GroupDocuments,
        groupNotices: state.PublicNotices.documents,
        groupMembers: (recordState.groupData && recordState.groupData.members) ? recordState.groupData.members : [],
        agendasAndMinutes: documentsByYear(state.agendasAndMinutes.documents),
        loading: loading,
        store: ownProps.store
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: (groupName) => {
          dispatch(fetchOrganizationalUnitData(groupName))
          dispatch(fetchPageAsides(groupName));
          dispatch(fetchGroupNotices(groupName));
          dispatch(fetchGroupDoc(groupName));
          dispatch(fetchMeetingDocs(groupName));
       }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DepartmentsUI);

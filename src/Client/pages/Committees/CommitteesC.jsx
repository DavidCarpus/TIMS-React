// import React from 'react';
import CommitteesUI from './Committees'
import { connect } from 'react-redux'
import { fetchOrganizationalUnitData } from '../../actions/OrganizationalUnitData'
import {fetchGroupNews} from '../../actions/PublicDocuments'
import {fetchGroupDoc} from '../../actions/PublicDocuments'
import {fetchMeetingDocs} from '../../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {
    var groupName=  ownProps.match.params.committee;
    let recordState = state.OrganizationalUnits;

    let loadedGroupName = recordState.groupName
    let selectedGroupName = ownProps.groupName  || groupName

    // console.log( 'selectedGroupName,loadedGroupName |' , selectedGroupName,  loadedGroupName );

    if (groupName && ownProps.store && !recordState.loading && recordState.groupName && recordState.groupName.length > 0 && recordState.groupName !==   groupName) {
        // console.log(' | ' + groupName + ' | ' + ownProps.store  +' | ' +  !recordState.loading  +' | ' +  recordState.groupName  +' | ' +    groupName);
        // console.log('CommitteesUI:fetchOrganizationalUnitData', groupName);
        // ownProps.store.dispatch(fetchOrganizationalUnitData(groupName));
        if (state.MainMenus && state.MainMenus.menus && Object.keys(state.MainMenus.menus).length > 0 ) {
            let committeeMenu = state.MainMenus.menus['/BoardsAndCommittees']
            let newGroup = committeeMenu.menus
            .filter(menu =>  (menu.pageLink === '/'+selectedGroupName) )

            let oldGroup = committeeMenu.menus
            .filter(menu =>  (menu.pageLink === '/'+loadedGroupName) )

            // new group and old group both in 'Departments', fetch from here (otherwise do in componentWillMount )
            if ( newGroup.length > 0 && oldGroup.length >  0) {
                // console.log('CommitteesUI:fetchOrganizationalUnitData:', groupName);
                // console.log( 'DepartmentsUI: | ' + ownProps.store  +' | ' +  !recordState.loading  +' | ' +  recordState.groupName  +' | ' +    groupName);

                ownProps.store.dispatch(fetchOrganizationalUnitData(groupName))
                ownProps.store.dispatch(fetchGroupNews(groupName));
                ownProps.store.dispatch(fetchGroupDoc(groupName));
                ownProps.store.dispatch(fetchMeetingDocs(groupName));
                // loading= true;
            }
        }
    }
    const agendas = typeof state.agendasAndMinutes.documents === 'undefined' ? {} : state.agendasAndMinutes.documents
    // console.log('agendas:',agendas.keys());
    return {
        currentGroupName: groupName,
        groupName: groupName,
        groupData: recordState.groupData,
        groupLabel:  recordState.groupData.description ||  recordState.groupData.desc ||  groupName,
        group: recordState.groupData,
        groupPageText: recordState.groupData.pagetext ? recordState.groupData.pagetext[0]: '',
        loading: state.OrganizationalUnits.loading,
        documents: state.GroupDocuments.documents || [],
        groupMembers: (recordState.groupData && recordState.groupData.members) ? recordState.groupData.members : [],
        agendas: Object.keys(agendas),
        notices: state.PublicNotices.documents || [],
    };
}

const mapDispatchToProps = (dispatch) => {
  return {

      fetchOUData: (groupName) => {
          dispatch(fetchOrganizationalUnitData(groupName))
          dispatch(fetchOrganizationalUnitData(groupName))
          dispatch(fetchGroupNews(groupName))
          dispatch(fetchGroupDoc(groupName))
          dispatch(fetchMeetingDocs(groupName))
      }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommitteesUI);

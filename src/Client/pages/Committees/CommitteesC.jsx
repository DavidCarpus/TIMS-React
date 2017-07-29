// import React from 'react';
import CommitteesUI from './Committees'
import { connect } from 'react-redux'
import { fetchOrganizationalUnitData } from '../../actions/OrganizationalUnitData'

const mapStateToProps = (state, ownProps) => {
    var groupName=  ownProps.match.params.committee;
    let recordState = state.OrganizationalUnits;
    // console.log('CommitteesUI:fetchOrganizationalUnitData?', groupName, ownProps);

    if (groupName && ownProps.store && !recordState.loading && recordState.groupName !==   groupName) {
        console.log('CommitteesUI:fetchOrganizationalUnitData', groupName);
        ownProps.store.dispatch(fetchOrganizationalUnitData(groupName));
    }

    return {
        currentGroupName: groupName,
        groupName: groupName,
        groupData: recordState.groupData,
        groupLabel:  recordState.groupData.description ||  recordState.groupData.desc ||  groupName,
        group: recordState.groupData,
        groupPageText: recordState.groupData.pagetext ? recordState.groupData.pagetext[0]: '',
        loading: state.OrganizationalUnits.loading
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
    //   fetchOUData: (groupName) => {
    //       dispatch(fetchOrganizationalUnitData(groupName))
    //  }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommitteesUI);

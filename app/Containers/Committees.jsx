import React from 'react';
import CommitteesUI from '../Components/Committees'
import { connect } from 'react-redux'
import { fetchOrganizationalUnitData } from '../actions/OrganizationalUnitData'

const mapStateToProps = (state, ownProps) => {
    return {
        currentGroupName: ownProps.params.committee,
        groupName: ownProps.params.committee,
        groupData: state.OrganizationalUnits.groupData,
        group: state.OrganizationalUnits.groupData,
        groupPageText: state.OrganizationalUnits.groupData.pagetext ?
                                    state.OrganizationalUnits.groupData.pagetext[0]:
                                    '',
        loading: state.OrganizationalUnits.loading
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
      fetchOUData: (groupName) => {
          dispatch(fetchOrganizationalUnitData(groupName))
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommitteesUI);

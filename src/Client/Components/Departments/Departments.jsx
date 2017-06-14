// import React from 'react';
import DepartmentsUI from './DepartmentsUI'
import { connect } from 'react-redux'
import { fetchOrganizationalUnitData } from '../../actions/OrganizationalUnitData'

const mapStateToProps = (state, ownProps) => {

    var groupName=  ownProps.match.params.department;
    let recordState = state.OrganizationalUnits;

    if (groupName === 'TransferRules') {
        groupName = 'PublicWorks'
    }

    if (groupName && ownProps.store && !recordState.loading && recordState.groupName !==   groupName) {
        console.log('fetchOUData:' +  groupName);
        ownProps.store.dispatch(fetchOrganizationalUnitData(groupName));
    }

    return {
        groupName:  groupName,
        groupData:  recordState.groupData,
        loading: state.OrganizationalUnits.loading,
        store: ownProps.store
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
      fetchOUData: (groupName) => {
          dispatch(fetchOrganizationalUnitData(groupName))
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DepartmentsUI);

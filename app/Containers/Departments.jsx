import React from 'react';
import DepartmentsUI from '../Components/DepartmentsUI'
import { connect } from 'react-redux'
import { fetchOrganizationalUnitData } from '../actions/OrganizationalUnitData'

const mapStateToProps = (state, ownProps) => {
    const groupName =  ownProps.params.department;
    return {
        currentGroupName: groupName,
        groupData: state.OrganizationalUnits.groupData,
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

export default connect(mapStateToProps, mapDispatchToProps)(DepartmentsUI);

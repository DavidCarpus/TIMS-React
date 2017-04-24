import React from 'react';
import DepartmentsUI from '../Components/DepartmentsUI'
import { connect } from 'react-redux'
import { fetchOrganizationalUnitData } from '../actions/OrganizationalUnitData'

const mapStateToProps = (state, ownProps) => {
    var groupName=  ownProps.params.department;
    if (groupName == '' && ownProps.route) { groupName= ownProps.route.groupName }
    if (groupName == '' ) { groupName= 'Department param not set?' }

    return {
        groupName:  groupName,
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

import React from 'react';
import TransferStationRulesUI from '../Components/TransferStationRules'
 import { connect } from 'react-redux'
 import { fetchOrganizationalUnitData } from '../actions/OrganizationalUnitData'

const mapStateToProps = (state, ownProps) => {
    var wasteTypes= [];
    var feeSchedule= [];
    if (state.OrganizationalUnits.groupData && state.OrganizationalUnits.groupData.transferrules){
        wasteTypes = state.OrganizationalUnits.groupData.transferrules.wasteTypes;
        feeSchedule = state.OrganizationalUnits.groupData.transferrules.feeSchedule;
    }
    if (ownProps.group && ownProps.group.transferrules){
        wasteTypes = ownProps.group.transferrules.wasteTypes;
        feeSchedule = ownProps.group.transferrules.feeSchedule;
    }

    return {
        group: state.OrganizationalUnits.groupData,
        loading: state.OrganizationalUnits.loading,
        wasteTypes: wasteTypes,
        feeSchedule: feeSchedule,
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
      fetchOUData: (groupName) => {
          dispatch(fetchOrganizationalUnitData(groupName))
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransferStationRulesUI);

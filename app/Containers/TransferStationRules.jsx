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
    if (state.OrganizationalUnits.groupData && state.OrganizationalUnits.groupData.wastetypes){
        wasteTypes = state.OrganizationalUnits.groupData.wastetypes;
        feeSchedule = state.OrganizationalUnits.groupData.feeschedule;
    }
    if (ownProps.group && ownProps.group.transferrules){
        wasteTypes = ownProps.group.transferrules.wasteTypes;
        feeSchedule = ownProps.group.transferrules.feeSchedule;
    }
    if (wasteTypes.length == 0) {
        console.log('wasteTypes is EMPTY');
        console.log('state.OrganizationalUnits:' + require('util').inspect(state.OrganizationalUnits, { depth: null }));
        console.log('ownProps.group:' + require('util').inspect(ownProps.group, { depth: null }));
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

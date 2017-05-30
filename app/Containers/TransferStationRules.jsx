import React from 'react';
import TransferStationRulesUI from '../Components/TransferStationRules'
 import { connect } from 'react-redux'
 import { fetchOrganizationalUnitData } from '../actions/OrganizationalUnitData'

const mapStateToProps = (state, ownProps) => {
    var wasteTypes=[];
    var feeSchedule=[];

    // console.log('TransferStationRulesUI:mapStateToProps');
    if (state.OrganizationalUnits.groupData && state.OrganizationalUnits.groupData.wastetypes && state.OrganizationalUnits.groupData.wastetypes.length > 0){
        // console.log('Setting wasteTypes from OrganizationalUnits.');
        wasteTypes = state.OrganizationalUnits.groupData.wastetypes;
        feeSchedule = state.OrganizationalUnits.groupData.feeschedule;
    }
    if (ownProps.group && ownProps.group.wastetypes && ownProps.group.wastetypes.length > 0){
        // console.log('Setting wasteTypes from group.');
        wasteTypes = ownProps.group.wastetypes;
        feeSchedule = ownProps.group.feeschedule;
    }
    if (typeof wasteTypes == 'undefined') {
        console.log('wasteTypes NOT set!!?');
        console.log('groupData-keys' , Object.keys(state.OrganizationalUnits.groupData));
        console.log('state.OrganizationalUnits:' + require('util').inspect(state.OrganizationalUnits, { depth: null }));
        console.log('ownProps.group:' + require('util').inspect(ownProps.group, { depth: null }));
    }
    console.log('mapStateToProps:wasteTypes:',wasteTypes);
    // if (ownProps.group && ownProps.group.transferrules){
    //     wasteTypes = ownProps.group.transferrules.wastetypes;
    //     feeSchedule = ownProps.group.transferrules.feeSchedule;
    // }

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

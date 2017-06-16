// import React from 'react';
import TransferStationRulesUI from './TransferStationRules'
 import { connect } from 'react-redux'
 import { fetchOrganizationalUnitData } from '../../actions/OrganizationalUnitData'

const mapStateToProps = (state, ownProps) => {
    var wasteTypes=[];
    var feeSchedule=[];

    // console.log('TransferStationRulesUI:mapStateToProps', state.OrganizationalUnits);
    if (ownProps.store && !state.OrganizationalUnits.loading && state.OrganizationalUnits.groupName !== 'PublicWorks') {
        // console.log('TransferStationRules fetchOUData:',state.OrganizationalUnits );
        ownProps.store.dispatch(fetchOrganizationalUnitData('PublicWorks'));
        // ownProps.fetchOUData(groupName);
    }

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

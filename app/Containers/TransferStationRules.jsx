import React from 'react';
import TransferStationRulesUI from '../Components/TransferStationRules'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
    return {
        wasteTypes: ownProps.group.transferrules.wasteTypes,
        feeSchedule: ownProps.group.transferrules.feeSchedule
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchDocs: () => { console.log('Test') }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransferStationRulesUI);

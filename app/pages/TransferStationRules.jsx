import React from 'react';
 import TransferStationRulesContainer from '../Containers/TransferStationRules'
//  import data from '../Data/PublicWorks.json'
//  var wasteTypes = data.transferrules.wasteTypes
// var feeSchedule =data.transferrules.feeSchedule

export default class TransferStationRules extends React.Component {
    render() {
        return (
            <div>
                <TransferStationRulesContainer />
            </div>
        )
    }
}

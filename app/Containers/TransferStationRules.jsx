import React from 'react';
 import TransferStationRulesUI from '../Components/TransferStationRules'
 // import data from '../Data/PublicWorks.json'

 import organizations from '../Data/OrganizationalUnits.json'


export default class TransferStationRules extends React.Component {
    render() {
        var publicWorksData = organizations.filter( (organization)=>
            {return organization.link == 'PublicWorks' } )[0]
        var wasteTypes = publicWorksData.transferrules.wasteTypes
       var feeSchedule =publicWorksData.transferrules.feeSchedule

        return (
            <div>
                <TransferStationRulesUI wasteTypes={wasteTypes} feeSchedule={feeSchedule} />
            </div>
        )
    }
}

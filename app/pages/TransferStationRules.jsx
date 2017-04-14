import React from 'react';
 import TransferStationRulesContainer from '../Containers/TransferStationRules'
 import organizations from '../Data/OrganizationalUnits.json'

export default class TransferStationRules extends React.Component {
    render() {
        var group = organizations.filter( (organization)=>
            {return organization.link == 'PublicWorks' } )[0]

        return (
            <div>
                <TransferStationRulesContainer group={group}/>
            </div>
        )
    }
}

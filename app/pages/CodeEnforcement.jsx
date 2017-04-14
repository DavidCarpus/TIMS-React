import React from 'react';
 import CodeEnforcementUI from '../Components/CodeEnforcement'
 import organizations from '../Data/OrganizationalUnits.json'

export default class CodeEnforcement extends React.Component {
    render() {
        var group = organizations.filter( (organization)=>
            {return organization.link == 'CodeEnforcement' } )[0]

        return (
            <div>
                <CodeEnforcementUI group={group} helpfulInformation={group.helpfulInformation} />
            </div>
        )
    }
}

import React from 'react';
 import CodeEnforcementUI from '../Components/CodeEnforcement'
 import organizations from '../Data/OrganizationalUnits.json'

export default class CodeEnforcement extends React.Component {
    render() {
        var codeEnforcementData = organizations.filter( (organization)=>
            {return organization.link == 'CodeEnforcement' } )[0]
        var helpfulInformation = codeEnforcementData.helpfulInformation

        return (
            <div>
                <CodeEnforcementUI helpfulInformation={helpfulInformation} />
            </div>
        )
    }
}

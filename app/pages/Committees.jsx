import React from 'react';
 import CommitteesUI from '../Components/Committees'

 import organizations from '../Data/OrganizationalUnits.json'
 import organizationPageText from '../Data/OrganizationPageText.json'


export default class Committees extends React.Component {
    render() {
        var groupName= this.props.params.commitee
        var group = organizations.filter( (organization)=>
            {return organization.link == groupName } )[0]
        var groupPageText = organizationPageText.filter( (organization)=>
                    {return organization.name == groupName } )
        if (groupPageText != null) {
            groupPageText = groupPageText[0]
        }

        return (
            <div>
                <CommitteesUI group={group} groupPageText={groupPageText}/>
            </div>
        )
    }
}

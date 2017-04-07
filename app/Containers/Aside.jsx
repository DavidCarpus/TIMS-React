import React from 'react';
 // import data from '../Data/Asides.json'
 import SmartLink from '../Components/SmartLink'
 import AsideUI from '../Components/Aside'

 import organizations from '../Data/OrganizationalUnits.json'


export default class Aside extends React.Component {
    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_Asides'
        var title = this.props.title || `Milton ${groupName} Documentation`
        var groupData = organizations.filter( (organization)=>
            {return organization.link == groupName } )[0]

        var asides = groupData.asides || []

        return (
            <AsideUI asides={asides} title={title} groupName={groupName} />
        )
    }
}

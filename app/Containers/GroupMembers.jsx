import React from 'react';
 import SmartLink from '../Components/SmartLink'
 import GroupMembersUI from '../Components/GroupMembers'
 import organizations from '../Data/OrganizationalUnits.json'

export default class GroupMembers extends React.Component {
    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_GroupMembers'
        var title = this.props.title || `Milton ${groupName} Documentation`

        var groupData = organizations.filter( (organization)=>
            {return organization.link == groupName } )[0]
        var members = groupData.members || []

        return (
            <div>
                <GroupMembersUI members={members} title={title} groupName={groupName} />
            </div>
        )
    }
}

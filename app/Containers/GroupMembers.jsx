import React from 'react';
 import data from '../Data/GroupMembers.json'
 import SmartLink from '../Components/SmartLink'
 import GroupMembersUI from '../Components/GroupMembers'

export default class GroupMembers extends React.Component {
    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_GroupMembers'
        var title = this.props.title || `Milton ${groupName} Documentation`
        var members = data.filter( (member)=>
                    {return member.groupName == groupName } )

        return (
            <div>
                <GroupMembersUI members={members} title={title} groupName={groupName} />
            </div>
        )
    }
}

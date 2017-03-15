import React from 'react';
 import data from './Data/GroupMembers.json'
 import SmartLink from './SmartLink'

export default class GroupMembers extends React.Component {
    render() {
        // var groupName= 'Sewer'
        var groupName= this.props.groupName
        var id = groupName + '_Members'
        var title = this.props.title || `${groupName} Members`
        var members = data.filter( (member)=>
                    {return member.groupName == groupName } )

        var office = { float: 'left', width:'150px', }
        var name = { float: 'left' , width:'300px', }
        var term = { float: 'left' , width:'150px', }

        var memberBlock = {
            clear: 'left'
        }
        var groupMembers = {
            // width:'500px',
            clear: 'left',
            display: 'inline-block'
        }
        return (
            <div id={id} style={groupMembers}>
                {members.length > 0 ? <h2>{title}</h2> : ''}
                    {members.map( (member, index) =>
                            <div key={index} style={memberBlock}>
                                <div style={office}>{member.office}</div>
                                <div style={name}>{member.name}</div>
                                <div style={term}>{member.term}</div>
                            </div>
                        )}
            </div>
        )
    }
}

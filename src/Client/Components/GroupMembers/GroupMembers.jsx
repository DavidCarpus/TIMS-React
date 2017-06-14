import React from 'react';
 // import SmartLink from '../Components/SmartLink'

 import  './GroupMembers.css'

export default class GroupMembers extends React.Component {
    render() {
        var id = this.props.groupName + '_Members'
        let memberClassName="groupMembers";
        let heading = this.props.title;
        if(this.props.members.length === 0) memberClassName="groupMembersEmpty";
        if(this.props.members.length === 0) heading="";

        return (
            <div id={id} className={memberClassName}>
                <h2>{heading}</h2>
                    {this.props.members.map( (member, index) =>
                            <div key={index} className="memberBlock">
                                <div className="office">{member.office}</div>
                                <div className="name">{member.name}</div>
                                <div className="name">{member.phone}</div>
                                <div className="term">{member.term}</div>
                            </div>
                        )}
            </div>
        )
    }
}

// this.props.members.length === 0
// ? <div id={id} className="groupMembersEmpty"></div>
// :

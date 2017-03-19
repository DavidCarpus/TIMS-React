import React from 'react';
 import data from './Data/GroupMembers.json'
 import SmartLink from './SmartLink'

 import styles from './GroupMembers.css'

export default class GroupMembers extends React.Component {
    render() {
        // var groupName= 'Sewer'
        var groupName= this.props.groupName
        var id = groupName + '_Members'
        var title = this.props.title || `${groupName} Members`
        var members = data.filter( (member)=>
                    {return member.groupName == groupName } )

        return (
            members.length == 0
            ? <div id={id} className={styles.groupMembersEmpty}></div>
            :
            <div id={id} className={styles.groupMembers}>
                {members.length > 0 ? <h2>{title}</h2> : ''}
                    {members.map( (member, index) =>
                            <div key={index} className={styles.memberBlock}>
                                <div className={styles.office}>{member.office}</div>
                                <div className={styles.name}>{member.name}</div>
                                <div className={styles.term}>{member.term}</div>
                            </div>
                        )}
            </div>
        )
    }
}

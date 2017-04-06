import React from 'react';
 import SmartLink from '../Components/SmartLink'

 import styles from '../assets/Styles/GroupMembers.css'

export default class GroupMembers extends React.Component {
    render() {
        var id = this.props.groupName + '_Members'

        return (
            this.props.members.length == 0
            ? <div id={id} className={styles.groupMembersEmpty}></div>
            :
            <div id={id} className={styles.groupMembers}>
                <h2>{this.props.title}</h2>
                    {this.props.members.map( (member, index) =>
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

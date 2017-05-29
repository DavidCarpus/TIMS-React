import React from 'react';
import styles from '../assets/Styles/Notices.css'
import SmartLink from './SmartLink'

export default class NoticesList extends React.Component {
    componentWillMount() {
        var groupName = this.props.groupName || this.props.group.link || this.props.group.description || 'missing groupName'
        if (this.props.noticesGroupName != groupName) {
            this.props.fetchNotices(groupName);
        }
    }

render(){
    return (
        this.props.notices.length == 0
        ? <section id='notices'></section>
        :
        <section id='notices'>
            <h2>Notices</h2>
            <ul className={styles.hidebullets}>{this.props.notices.
                map( (notice,index) =>
                    <li key={notice.id || index}>
                        <SmartLink link={notice.link} linkText={notice.description} />
                    </li>
            )}</ul>

        </section>
    )
    }
}

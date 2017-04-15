import React from 'react';
import styles from '../assets/Styles/Notices.css'
import SmartLink from './SmartLink'

export default class NoticesList extends React.Component {
    componentWillMount() {
        this.props.fetchNotices(this.props.group.link);
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
                        <SmartLink link={notice.link} linkText={notice.desc} />
                    </li>
            )}</ul>

        </section>
    )
    }
}

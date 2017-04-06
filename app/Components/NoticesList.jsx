import React from 'react';
import styles from './Styles/Notices.css'
import SmartLink from './SmartLink'

export default class NoticesList extends React.Component {
render(){
    return (
        this.props.notices.length == 0
        ? <section id='notices'></section>
        :
        <section id='notices'>
            <h2>Notices</h2>
            <ul className={styles.hidebullets}>{this.props.notices.
                map(notice =>
                    <li key={notice.id}>
                        <SmartLink link={notice.link} linkText={notice.shortDesc} />
                    </li>
            )}</ul>

        </section>
    )
    }
}

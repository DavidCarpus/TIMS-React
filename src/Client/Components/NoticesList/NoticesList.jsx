import React from 'react';
import styles from './Notices.css'
import SmartLink from '../SmartLink/SmartLink'

export default class NoticesList extends React.Component {
render(){
    return (
        this.props.notices.length === 0
        ? <section id='notices'></section>
        :
        <section id='notices'>
            <h2>Notices</h2>
            <ul className={styles.hidebullets}>{this.props.notices
                .map( (notice,index) =>
                    <li key={notice.id || index}>
                        <SmartLink link={notice.link} id={notice.id} linkText={notice.description} />
                    </li>
            )}</ul>

        </section>
    )
    }
}

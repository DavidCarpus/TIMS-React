import React from 'react';
import styles from './Notices.css'
import SmartLink from './SmartLink'
import notices from './Data/Notices.json'

class NoticeListElement extends React.Component {
    render(){
        return (
            <li>
                <SmartLink link={this.props.notice.link} linkText={this.props.notice.shortDesc} />
            </li>
        )
    }
}
export default class NoticesList extends React.Component {
render(){
    return (
        <section id='notices'>
            <h2>Notices</h2>
            <ul>{this.props.notices.
                map(notice =>
                    <NoticeListElement
                        key={notice.id}
                        notice={notice}/>
            )}</ul>

        </section>
    )
    }
}

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
    var text1 = ''
    // text1 = JSON.stringify(this.props.notices);
    return (
        this.props.notices.length == 0
        ? <div>{text1}</div>
        :
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

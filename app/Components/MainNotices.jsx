import React from 'react';
import notices from './Data/MainNotices.json';
import { Link } from 'react-router'
import styles from './MainNotices.css'

class MainNotice extends React.Component {
    render(){
        var url=this.props.notice.link;
        // var dump=JSON.stringify(this.props.notice);
        // var dump='Dump';
        var lnk = ''
        if (url.length == 0 ){
            lnk = (<p>{this.props.notice.shortDesc}</p>)
        }
        else if (url.startsWith('http')) {
            lnk = (<a href={url}>{this.props.notice.shortDesc}</a>)
        } else {
            lnk = (<Link to={url}>{this.props.notice.shortDesc}</Link >)
        }
        return (
            <div className={ styles.mainNotice }>
                {lnk}
            </div>
        )
    }
}
export default class MainNotices extends React.Component {
render(){
    return (
        <section id='main_notices'>
            <h2>Notices</h2>
              {notices.filter( (notice)=> {return notice.active} ).
                  map(notice =>
                      <MainNotice
                          key={notice.id}
                          notice={notice}/>
                  )}

        </section>
    )
    }
}

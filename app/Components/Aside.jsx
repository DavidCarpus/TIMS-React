import React from 'react';
import styles from '../assets/Styles/Aside.css'
import SmartLink from './SmartLink'

class AsideItem extends React.Component {
    createMarkup(){
        var desc = this.props.item.desc
        return {__html: desc};
    }

    render() {
        // var desc = this.createMarkup()
        var linkText = this.props.item.desc
        var desc = {__html: this.props.item.desc}
        var hasLink  = (this.props.item.link != null)
        return (
            <li >
            {hasLink
            ?
             (<SmartLink link={this.props.item.link} linkText={linkText}/>)
            :
            (<p dangerouslySetInnerHTML={desc} ></p>)
            }
            </li>
        );
    }
}
/*
(<a href={this.props.item.link} dangerouslySetInnerHTML={desc} ></a>)
(<SmartLink link='/ContactUs' linkText={desc}/>)
var desc = {__html: this.props.item.desc}
*/

export default class MainAside extends React.Component {
    render() {
        var id = this.props.groupName + '_Asides'
        var title = this.props.title
        var asides = this.props.asides

        var recentEvents = this.props.data || asides
        var list = ''
        // if ('data' in this.props && recentEvents.length > 0) {
            list = recentEvents.map((element, index) =>
                <AsideItem key={index} item={element} />
                )
        // }
        return (
            <aside id={id} className={styles.primaryAside}>
            <ul>
                {list}
            </ul>

        </aside>
        );
    }
}

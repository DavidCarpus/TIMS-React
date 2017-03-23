import React from 'react';
import styles from './Styles/Aside.css'
import asideData from '../Data/Asides.json'

class AsideItem extends React.Component {
    createMarkup(){
        var desc = this.props.item.desc
        return {__html: desc};
    }

    render() {
        // var desc = this.createMarkup()
        // var desc = this.props.item.desc
        var desc = {__html: this.props.item.desc}
        var hasLink  = (this.props.item.link != null)
        return (
            <li >
            {hasLink
            ?
            (<a href={this.props.item.link} dangerouslySetInnerHTML={desc} ></a>)
            :
            (<p dangerouslySetInnerHTML={desc} ></p>)
            }
            </li>
        );
    }
}

export default class MainAside extends React.Component {
    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_Asides'
        var title = this.props.title || `Milton ${groupName} Documentation`
        var asides = asideData.filter( (aside)=>
                    {return aside.department == groupName } )

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

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
        var desc = {__html: this.props.item.description}
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

export default class MainAside extends React.Component {
    componentWillMount() {
        var groupName = this.props.groupName || this.props.group.link || this.props.group.description || 'missing groupName'
        this.props.fetchData(groupName);
    }

    render() {
        var groupName = this.props.groupName || this.props.group.link || this.props.group.description || 'missing groupName'
        var id = groupName + '_Asides'

        var recentEvents = this.props.asides.PageAsides || this.props.asides
        return (
            <aside id={id} className={styles.primaryAside}>
            <ul>
                {recentEvents.map((element, index) =>
                    <AsideItem key={index} item={element} />
                )}
            </ul>

        </aside>
        );
    }
}

import React from 'react';
import styles from './Aside.css'
import layoutStyles from './MainLayout.css'

class AsideItem extends React.Component {
    createMarkup(){
        var desc = this.props.item.desc
        return {__html: desc};
    }

    render() {
        // var desc = this.createMarkup()
        // var desc = this.props.item.desc
        var desc = {__html: this.props.item.desc}
        return (
            <li dangerouslySetInnerHTML={desc} ></li>
        );
    }
}

export default class MainAside extends React.Component {
    render() {
        var recentEvents = this.props.data
        var list = ''
        if ('data' in this.props && recentEvents.length > 0) {
            list = recentEvents.map((element, index) =>
                <AsideItem key={index} item={element} />
                )
        }
        return (
            <aside className={layoutStyles.primaryAside}>
            <ul>
                {list}
            </ul>

        </aside>
        );
    }
}
/*
{recentEvents.map((element, index) =>
    <AsideItem key={index} item={element} />
    )}
*/

import React from 'react';
import s from './Aside.css'
import SmartLink from '../SmartLink/SmartLink'

class AsideItem extends React.Component {
    render() {
        // var desc = this.createMarkup()
        var linkText = this.props.item.description
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
    // componentWillMount() {
    //     var groupName = this.props.groupName || this.props.group.link || this.props.group.description || 'missing groupName'
    //     this.props.fetchData(groupName);
    // }

    render() {
        // console.log('Aside props:' + require('util').inspect(this.props, { depth: null }));
        // console.log('Render MainAside', this.props);
        var groupName = this.props.groupName || this.props.group.link || this.props.group.description || 'missing groupName'
        var id = groupName + '_Asides'

        // var recentEvents = this.props.asides.PageAsides || this.props.asides
        var recentEvents = this.props.asides || []
        // var tmp='Aside recentEvents:' + JSON.stringify(recentEvents);
        // {tmp}
        return (
            <aside id={id} className={s.primaryAside}>
                <ul>
                    {recentEvents.map((element, index) =>
                        <AsideItem key={index} item={element} />
                    )}
                </ul>

        </aside>
        );
    }
}
/*
*/

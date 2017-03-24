import React from 'react';
import { Link } from 'react-router'

export default class SmartLink extends React.Component {
    render(){
        // var url=this.props.link;
        var lnk = this.props.link || ''
        var text = this.props.linkText
            if (lnk.length == 0 ){
                return (<i>{this.props.linkText}</i>)
            } else if (lnk.startsWith('http')) {
                return (<a href={lnk}>{this.props.linkText}</a>)
            } else {
                return(<Link to={lnk}>{this.props.linkText}</Link >)
            }

    }
}

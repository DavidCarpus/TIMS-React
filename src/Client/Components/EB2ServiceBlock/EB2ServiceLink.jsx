import React from 'react';

export default class EB2ServiceLink extends React.Component {
    imageLink(service, secure){
        return (secure? 'https' : 'http') + '://www.eb2gov.com/Images/Themes/' + service.img
    }
    serviceLink(service, secure){
        return (secure? 'https' : 'http') + '://www.eb2gov.com/scripts/eb2gov.dll/' + service.urlLink
    }
    render() {
        var service=this.props.service
        console.log('this.props.secure:', this.props.secure);
        return (
            <a href={this.serviceLink(service, this.props.secure)}
                title={service.desc}
                rel="noopener noreferrer"
                target='_blank'>
                 <img src={this.imageLink(service, this.props.secure)} alt='Service Icon' /></a>
        );
    }
}

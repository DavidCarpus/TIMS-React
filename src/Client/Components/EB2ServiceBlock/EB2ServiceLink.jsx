import React from 'react';

export default class EB2ServiceLink extends React.Component {
    imageLink(service){
        return 'http://www.eb2gov.com/Images/Themes/' + service.img
    }
    serviceLink(service){
        return 'https://www.eb2gov.com/scripts/eb2gov.dll/' + service.urlLink
    }
    render() {
        var service=this.props.service

        return (
            <a href={this.serviceLink(service)}
                title={service.desc}
                rel="noopener noreferrer"
                target='_blank'>
                 <img src={this.imageLink(service)} alt='Service Icon' /></a>
        );
    }
}

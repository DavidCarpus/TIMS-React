import React from 'react';
import EB2ServiceLink from './EB2ServiceLink'

export default class EB2ServiceBlock extends React.Component {
    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_EB2ServiceBlock'
        // var out = JSON.stringify(this.props.services);

        return (
            <ul id={id} style={{listStyleType: 'none'}}>
                {this.props.services.map( (service, index) =>
                    <EB2ServiceLink key={index} service={service}/>
                    )}
            </ul>
        );
    }
}
/*



*/

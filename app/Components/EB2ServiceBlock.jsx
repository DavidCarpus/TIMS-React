import React from 'react';
import EB2ServiceLink from './EB2ServiceLink'
import servicesData from './Data/EB2Services.json'

export default class EB2ServiceBlock extends React.Component {
    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_EB2ServiceBlock'
        var services = []
        if (groupName.length > 0) {
            services = servicesData.services.filter( (service)=>
                        {return service.dept == groupName } )
        } else {
            services = servicesData.services
        }
        // var service=this.props.service
        var out = JSON.stringify(services);

        return (
            <ul id={id} style={{listStyleType: 'none'}}>
                {services.map( (service, index) =>
                        <EB2ServiceLink key={index} service={service}/>
                    )}
            </ul>
        );
    }
}

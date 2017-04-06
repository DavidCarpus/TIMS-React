import React from 'react';
 import EB2ServiceBlockUI from '../Components/EB2ServiceBlock'
 import {services} from '../Data/EB2Services.json'

export default class EB2ServiceBlock extends React.Component {
    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_EB2ServiceBlock'
        var title = this.props.title || ''
        var servicesData = services

         if (groupName.length > 0 ) {
                 servicesData = services.filter( (service)=>
                     {return service.dept == groupName } )
         }

        return (
            <div>
                <EB2ServiceBlockUI services={servicesData} title={title} />
            </div>
        )
    }
}

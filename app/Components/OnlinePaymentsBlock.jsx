import React from 'react';
import EB2ServiceLink from './EB2ServiceLink'

import servicesData from './Data/EB2Services.json'
var services = servicesData.services

export default class OnlinePaymentsBlock extends React.Component {
    render() {
        return (
            <div id='eb2govBlock'>
                <h2>Follow the links for Dog Licensing, Online Registration, Vital Records and to pay Taxes online.</h2>
                <ul style={{listStyleType: 'none'}}>
                    {services.
                        map( (service, index) =>
                            <EB2ServiceLink key={index} service={service}/>
                        )}
                </ul>

            </div>
        );
    }
}

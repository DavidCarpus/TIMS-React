import React from 'react';
import EB2ServiceBlock from '../Containers/EB2ServiceBlock'

export default class OnlinePaymentsBlock extends React.Component {
    render() {
        const onlineAssessmentButton= {
            backgroundColor: 'blue',
            color: 'white',
            width: '150px',
            height: '40px',
            display:'inline-block',
            textAlign: 'center',
            borderRadius: '10px',
            background: 'radial-gradient(blue, grey)'
        }
        return (
            <div id='eb2govBlock'>
                <h2>Follow the links for Dog Licensing, Online Registration, Vital Records or Property Taxes.</h2>
                <EB2ServiceBlock groupName={'Home'}/>
                <a href='https://nhtaxkiosk.com/?KIOSKID=MILTON' target='_blank'>
                    <div style={onlineAssessmentButton}>
                        <p>Property Taxes<br/>Review/Pay Online</p></div>
                </a>

            </div>
        );
    }
}

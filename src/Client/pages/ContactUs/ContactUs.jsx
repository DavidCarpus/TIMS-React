import React from 'react';

import { Col, Row } from 'reactstrap';
import ContactUsComponent  from '../../Components/ContactUs'

import  './ContactUs.css'

export default class ContactUs extends React.Component {
    render() {
        return (
            <Row>
                <Col  md={{size:10, push:1}} id='ContactUsPage'>
                    <ContactUsComponent/>
                </Col>
            </Row>
        );
    }
}

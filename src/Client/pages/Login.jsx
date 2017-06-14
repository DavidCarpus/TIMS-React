import React from 'react';
import {  Col } from 'react-bootstrap';

export default class Login extends React.Component {
    render() {
        return (
            <div>
                <Col md={12}  id="contentArea"  >
                    <input
                        type='email'
                        placeholder='Town provided email Address:'
                        label='Email Address:' />
                </Col>
        </div>
        );
    }
}

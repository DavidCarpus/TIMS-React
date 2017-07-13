import React from 'react';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import SmartLink from '../SmartLink'
import  './Footer.css'

export default class Footer extends React.Component {
    render(){
        return (
            <footer>
                <Row className="show-grid">
                    <Col md={2} ></Col>
                    <Col md={3} ><SmartLink link='/ContactUs' linkText='Contact Us' /></Col>
                    <Col md={3} ><SmartLink link='/Employment' linkText='Employment'/></Col>
                    <Col md={3} ><SmartLink link='/Index' linkText='Index / (Where do I go for ...)'/></Col>
                    <Col md={1} ></Col>
                </Row>
            </footer>
        )
    }
}

// <Col md={2} ><SmartLink link='/Login' linkText='Login'/></Col>

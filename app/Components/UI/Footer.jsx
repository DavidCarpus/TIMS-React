import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import SmartLink from './SmartLink'
import styles from './Styles/Footer.css'

export default class Footer extends React.Component {
    render(){
        return (
            <footer>
                <Row className="show-grid">
                    <Col md={4} ></Col>
                    <Col md={2} ><SmartLink link='/ContactUs' linkText='Contact Us' /></Col>
                    <Col md={2} ><SmartLink link='/Employment' linkText='Employment'/></Col>
                    <Col md={4} ></Col>
                </Row>
            </footer>
        )
    }
}

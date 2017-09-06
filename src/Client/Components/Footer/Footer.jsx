import React from 'react';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import SmartLink from '../SmartLink'
import  './Footer.css'

const links = [
    {link:'/ContactUs' , linkText:'Contact Us'},
    {link:'/Employment' , linkText:'Employment'},
    {link:'/Index' , linkText:'Index / (Where do I go for ...)'},
    // {link:'/RequestAlerts' , linkText:'Request Alerts'},
]
if (process.env.NODE_ENV === 'development') {
    links.push({link:'/RequestAlerts' , linkText:'Request Alerts'})
}

export default class Footer extends React.Component {
    render(){

        let colSize = Math.floor((12-1)/links.length);
        let padding= 12 - (colSize*links.length)
        if (padding > 3) {
            padding = padding/2
        }

        return (
            <footer id='footer'>
                <Row>
                    <Col md={padding} ></Col>
                    {links.map( (linkData, index) =>
                        <Col key={index} md={colSize} >
                            <SmartLink link={linkData.link} linkText={linkData.linkText} />
                        </Col>
                    )}
                </Row>
            </footer>
        )
    }
}

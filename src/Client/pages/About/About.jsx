import React from 'react';
// import Aside from '../../Components/Aside'
import { Col, Row } from 'reactstrap';
// import {  Col } from 'react-bootstrap';
import RawText from '../../Components/RawText'
import './About.css'

export default class About extends React.Component {
    componentWillMount() {
        // console.log('DepartmentsUI:componentWillMount: ' ,this.props);
        this.props.fetchData('About');
    }

render() {
    // var group ={'link' : 'About'}
    var group = this.props.group
    var groupPageText = [];
    if (Array.isArray(group.pagetext)) {
        groupPageText = group.pagetext[0];
    }
    return (
        <div>
            <Row id='About'>
                <Col  md={{size:10, push:1}} >
                    <div className="blockSection">
                        <h1 style={{textAlign:'center'}}>{this.props.Config.municipalLongName}</h1>
                        <RawText groupPageText={groupPageText} block='description' />
                    </div>
                </Col>
            </Row>
        </div>
    );
}

}

import React from 'react';
import Aside from '../../Components/Aside'
import {  Col } from 'react-bootstrap';
import RawText from '../../Components/RawText'

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
            <Col md={10}  mdPush={1} id="contentArea"  >
            <h1 style={{textAlign:'center'}}>About the {this.props.Config.municipalLongName}</h1>
                <RawText groupPageText={groupPageText} block='description' />
            </Col>
            <Col md={1} mdPull={10}><Aside group={group}   /></Col>
        </div>
    );
}

}

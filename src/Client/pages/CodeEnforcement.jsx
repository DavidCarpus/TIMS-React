import React from 'react';
 import {  Col } from 'react-bootstrap';

 import Aside from '../Components/Aside'
 import DocumentList  from '../Components/DocumentList'
 import SmartLink from '../Components/SmartLink'
 import RawText from '../Components/RawText'

export default class CodeEnforcement extends React.Component {
    render() {
        // var group = this.props.group;
        var helpfulInformation = this.props.group.helpfulinformation || [];
        // var groupPageText = [];
        // if (Array.isArray(this.props.group.pagetext)) {
        //     groupPageText = this.props.group.pagetext[0];
        // }
        return (
            <div>
                <Col md={9}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Code Enforcement</h1>
                    <RawText groupPageText={ this.props.group.pagetext} block='description' />

                    <h2>Helpful Information</h2>
                    {helpfulInformation.map((information, index) =>
                        <div key={information.id}><SmartLink link={information.fileLink} linkText={information.description} /></div>
                    )}


                    <DocumentList
                        group={this.props.group}
                        store={this.props.store}
                        title='Milton Code Enforcement Documentation'
                        />
                </Col>
                <Col md={2} mdPull={9}><Aside group={this.props.group} store={this.props.store} /></Col>
            </div>
        )
    }
}

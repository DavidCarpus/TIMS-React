import React from 'react';
import {  Col } from 'react-bootstrap';

import SmartLink from '../Components/SmartLink'
import Aside from '../Components/Aside'
import DocumentList  from '../Components/DocumentList'
import RawText from '../Components/RawText'

export default class Sewer extends React.Component {
    render() {
        var group = this.props.group;

        return (
            <div>
                <Col md={9}  mdPush={2} id="contentArea"  >
                        <h1 style={{textAlign:'center'}}>Sewer Department</h1>

                        <RawText groupPageText={this.props.group.pagetext} block='description' />


                        <DocumentList
                            group={group}
                            store={this.props.store}
                            title='Milton Sewage Department Documentation'
                            />
                        <SmartLink link='http://des.nh.gov/index.htm'
                            linkText='NH Department of Environmental Services (DES)'/>
                </Col>
                <Col md={2} mdPull={9}><Aside group={group} groupName={group.link} store={this.props.store} /></Col>

            </div>
        )
    }
}

import React from 'react';
import Aside from '../Components/Aside'

import OnlinePaymentsBlock  from '../Components/OnlinePaymentsBlock'
import NoticesList from '../Components/NoticesList'
import DocumentList  from '../Components/DocumentList'
import {  Col } from 'react-bootstrap';

export default class TownClerk extends React.Component {
    render() {
        var group = this.props.group;

        return (
            <div>
                <Col md={8}  mdPush={3} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Tax Collector/Town Clerk</h1>

                    <NoticesList group={group} store={this.props.store}/>

                    <OnlinePaymentsBlock/>
                    <p>The Town Clerk/Tax Collector's Office can process Hunting & Fishing Licenses, as well as Boat Registrations.</p>

                    <DocumentList group={group}  store={this.props.store} />

                </Col>
                <Col md={3} mdPull={8}><Aside group={group}  store={this.props.store} /></Col>
            </div>
        )
    }
}

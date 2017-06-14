import React from 'react';
import Aside from '../Components/Aside/AsideC'

import OnlinePaymentsBlock  from '../Components/OnlinePaymentsBlock'
import NoticesList from '../Components/NoticesList/NoticesListC'
import DocumentList  from '../Components/DocumentList/DocumentListC'
import {  Col } from 'react-bootstrap';

export default class TownClerk extends React.Component {
    render() {
        var group = this.props.group;
        // console.log('TownClerk group:' , group);
        // var groupPageText = group.pagetext;

        return (
            <div>
                <Col md={9}  mdPush={3} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Tax Collector/Town Clerk</h1>

                    <NoticesList group={group} store={this.props.store}/>

                    <OnlinePaymentsBlock/>
                    <p>The Town Clerk/Tax Collector's Office can process Hunting & Fishing Licenses, as well as Boat Registrations.</p>

                    <DocumentList group={group}  store={this.props.store} />

                </Col>
                <Col md={3} mdPull={9}><Aside group={group}  store={this.props.store} /></Col>
            </div>
        )
    }
}
/*

 data={asideData}

*/

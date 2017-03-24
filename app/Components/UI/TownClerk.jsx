import React from 'react';
import Aside from '../Containers/Aside'

import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import NoticesList from '../Containers/NoticesList'
import DocumentList  from '../Containers/DocumentList'
import { Grid, Row, Col } from 'react-bootstrap';

export default class TownClerk extends React.Component {
    render() {
        return (
            <div>
                <Col md={10}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Tax Collector/Town Clerk</h1>

                    <NoticesList groupName='TownClerk'/>

                    <OnlinePaymentsBlock/>
                    <p>The Town Clerk/Tax Collector's Office can process Hunting & Fishing Licenses, as well as Boat Registrations.</p>

                    <DocumentList groupName='TownClerk' />

                </Col>
                <Col md={2} mdPull={10}><Aside groupName='TownClerk' /></Col>
            </div>
        )
    }
}
// data={asideData}

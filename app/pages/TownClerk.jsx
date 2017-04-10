import React from 'react';
import Aside from '../Containers/Aside'

import OnlinePaymentsBlock  from '../Components/OnlinePaymentsBlock'
import NoticesList from '../Containers/NoticesList'
import DocumentList  from '../Containers/DocumentList'
import { Grid, Row, Col } from 'react-bootstrap';
import organizations from '../Data/OrganizationalUnits.json'

export default class TownClerk extends React.Component {
    render() {
        // const groupName='TownClerk'
        var group = organizations.filter( (organization)=>
            {return organization.link == 'TownClerk' } )[0]

        return (
            <div>
                <Col md={10}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Tax Collector/Town Clerk</h1>

                    <NoticesList group={group}/>

                    <OnlinePaymentsBlock/>
                    <p>The Town Clerk/Tax Collector's Office can process Hunting & Fishing Licenses, as well as Boat Registrations.</p>

                    <DocumentList group={group} />

                </Col>
                <Col md={2} mdPull={10}><Aside group={group}  /></Col>
            </div>
        )
    }
}
// data={asideData}

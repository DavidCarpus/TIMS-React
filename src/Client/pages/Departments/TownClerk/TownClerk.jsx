import React from 'react';
import Aside from '../../../Components/Aside'

import OnlinePaymentsBlock  from '../../../Components/OnlinePaymentsBlock'
import NoticesList from '../../../Components/NoticesList'
import DocumentList  from '../../../Components/DocumentList'
import { Col, Row } from 'reactstrap';
import HelpfulInformation  from '../../../Components/HelpfulInformation'

export default function TownClerk({group, store, loading, id, title='Tax Collector/Town Clerk'}){
    if ( loading) {         return (<div>Loading</div>)     }
    return (
        <Row id='TownClerk'>
            <Col  md={{size:9, push:3}} id='contentArea'>
                <h1 style={{textAlign:'center'}}>{title}</h1>

                <NoticesList group={group} store={store}/>

                <OnlinePaymentsBlock/>
                <p>The Town Clerk/Tax Collector's Office can process Hunting & Fishing Licenses, as well as Boat Registrations.</p>

                <DocumentList group={group}  store={store} />

                <HelpfulInformation informationArray={group.helpfulinformation || []} />
                </Col>
            <Col md={{size:3, pull:9}}> <Aside group={group} store={store} /> </Col>
        </Row>
    )

}

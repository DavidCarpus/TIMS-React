import React from 'react';
import Aside from '../Components/Aside'

import OnlinePaymentsBlock  from '../Components/OnlinePaymentsBlock'
import NoticesList from '../Components/NoticesList'
import DocumentList  from '../Components/DocumentList'
import SmartLink from '../Components/SmartLink'
import {  Col } from 'react-bootstrap';
import HelpfulInformation  from '../Components/HelpfulInformation'

export default function TownClerk({group, store, loading, id, title='Tax Collector/Town Clerk'}){
    if ( loading) {         return (<div>Loading</div>)     }
    return (
        <div>
            <Col md={8}  mdPush={3} id="contentArea"  >
                <h1 style={{textAlign:'center'}}>{title}</h1>

                <NoticesList group={group} store={store}/>

                <OnlinePaymentsBlock/>
                <p>The Town Clerk/Tax Collector's Office can process Hunting & Fishing Licenses, as well as Boat Registrations.</p>

                <DocumentList group={group}  store={store} />

                <HelpfulInformation informationArray={group.helpfulinformation || []} />
            </Col>
            <Col md={3} mdPull={8}><Aside group={group}  store={store} /></Col>
        </div>
    )

}

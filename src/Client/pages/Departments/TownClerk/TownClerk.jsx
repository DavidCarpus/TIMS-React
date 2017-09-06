import React from 'react';

import OnlinePaymentsBlock  from '../../../Components/OnlinePaymentsBlock'
import NoticesList from '../../../Components/NoticesList'
import DocumentList  from '../../../Components/DocumentList'
import { Col, Row } from 'reactstrap';
import GroupMembers from '../../../Components/GroupMembers'
import HelpfulInformation  from '../../../Components/HelpfulInformation'
import PageNavbar from '../../../Components/PageNavbar'

function pageNav() {
    return (
    <PageNavbar menus={[
            {text:'^^^', target:'primary-content-top'},
            {text:'Doc', target:'DocumentList-bookmark'},
            {text:'Contact', target:'groupMembers-bookmark'}
        ]}/>
    )
}

export default function TownClerk({group, store, loading, id, title='Tax Collector/Town Clerk'}){
    if ( loading) {         return (<div>Loading</div>)     }
    return (
        <Row id='TownClerk'>
            {pageNav()}

            <Col  md={{size:10, push:1}} id='contentArea'>
                <h1 style={{textAlign:'center'}}>{title}</h1>

                <NoticesList group={group} store={store}/>

                <OnlinePaymentsBlock/>
                <p>The Town Clerk/Tax Collector's Office can process Hunting & Fishing Licenses, as well as Boat Registrations.</p>

                <DocumentList group={group}  store={store} />
                <GroupMembers group={group}  title={' Contacts'}  showTerm={false} showEmail/>

                <HelpfulInformation informationArray={group.helpfulinformation || []} />
            </Col>
        </Row>
    )
}

import React from 'react';
import { Col, Row } from 'reactstrap';

 import DocumentList  from '../../../Components/DocumentList'
 import RawText from '../../../Components/RawText'
 import HelpfulInformation  from '../../../Components/HelpfulInformation'
 import GroupMembers from '../../../Components/GroupMembers'
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

export default function CodeEnforcement({group, store, loading, id, title='Code Enforcement'}){
    return (
        <Row id='CodeEnforcement'>
            {pageNav()}

            <Col  md={{size:10, push:1}} id='contentArea'>
                <h1 style={{textAlign:'center'}}>Code Enforcement</h1>
                <RawText groupPageText={ group.pagetext} block='description' />

                <HelpfulInformation informationArray={group.helpfulinformation || []} />
                <DocumentList group={group} store={store} title='Milton Code Enforcement Documentation' />
                <GroupMembers group={group}  title={' Contacts'}  showTerm={false} />
            </Col>
        </Row>
    )
}

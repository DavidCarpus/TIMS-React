import React from 'react';
import { Col, Row } from 'reactstrap';

 import DocumentList  from '../../../Components/DocumentList'
 import RawText from '../../../Components/RawText'
 import HelpfulInformation  from '../../../Components/HelpfulInformation'
 import GroupMembers from '../../../Components/GroupMembers'
 import {PageNavbar} from '../../../Components/PageNavbar'

 function pageNav() {
     return (
     <PageNavbar menus={[
             {text:'^^^', target:'primary-content-top'},
             {text:'Doc', target:'DocumentList-bookmark', fontAwsomeIcon:'fa-file-text'},
             {text:'Contact', target:'groupMembers-bookmark', fontAwsomeIcon:'fa-address-book'}
         ]}/>
     )
 }

export default function CodeEnforcement({group, groupName, store, loading, id, title='Code Enforcement'}){
    return (
        <Row id='CodeEnforcement'>
            {pageNav()}

            <Col  md={{size:10, push:1}}>
                <div className="blockSection">
                    <h1 style={{textAlign:'center'}}>{title}</h1>
                    <RawText id='description' groupPageText={group.pagetext} block='description' />
                </div>


                <HelpfulInformation informationArray={group.helpfulinformation || []} />
                <DocumentList groupName={groupName} group={group} store={store} title='Milton Code Enforcement Documentation' />
                <GroupMembers group={group}  title={' Contacts'}  showTerm={false} />
            </Col>
        </Row>
    )
}

// <h1 style={{textAlign:'center'}}>Code Enforcement</h1>
// <RawText groupPageText={ group.pagetext} block='description' />

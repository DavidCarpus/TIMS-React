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
             {text:'Doc', target:'DocumentList-bookmark', fontAwsomeIcon:'fa-file-text'},
             {text:'Contact', target:'groupMembers-bookmark', fontAwsomeIcon:'fa-address-book'}
         ]}/>
     )
 }

export default function ForestFireWarden({group, store, loading, id, title='Forest Fire Warden'}){
    return (
        <Row id='ForestFireWarden'>
            {pageNav()}

            <Col  md={{size:10, push:1}}>
                <div className="blockSection">
                    <h1 style={{textAlign:'center'}}>{title}</h1>
                    <RawText id='description' groupPageText={group.pagetext} block='description' />
                </div>


                <HelpfulInformation informationArray={group.helpfulinformation || []} />
                <DocumentList group={group} store={store} title='ForestFireWarden' />
                <GroupMembers group={group}  title={' Contacts'}  showTerm={false} />
            </Col>
        </Row>
    )
}

// <h1 style={{textAlign:'center'}}>Code Enforcement</h1>
// <RawText groupPageText={ group.pagetext} block='description' />

import React from 'react';
import { Col, Row } from 'reactstrap';

import  './Assessing.css'
import DocumentList  from '../../../Components/DocumentList'
import RawText from '../../../Components/RawText'
import TaxMapForm  from '../../../Components/TaxMapForm'
import PageNavbar from '../../../Components/PageNavbar'
import GroupMembers from '../../../Components/GroupMembers'

function pageNav() {
    return (
    <PageNavbar menus={[
            {text:'^^^', target:'primary-content-top', hoverText:'Top'},
            {text:'Doc', target:'DocumentList-bookmark', fontAwsomeIcon:'fa-file-text'},
            {text:'Contacts', target:'groupMembers-bookmark', fontAwsomeIcon:'fa-address-book'}
        ]}/>
    )
}

export default function Assessing({group, store, loading, id, title='Assessing Department'}){
    // {pageNav()}
    return (
        <Row id='Assessing'>
            {pageNav()}

            <Col  md={{size:10, push:1}} id='contentArea'>
                <div id="description">
                    <h1 style={{textAlign:'center'}}>{title}</h1>
                    <RawText id='description' groupPageText={group.pagetext} block='description' />
                </div>

                <div >
                    <div  style={{width:'48%'}}>
                        <a href='http://data.avitarassociates.com/logondirect.aspx?usr=milton&pwd=milton'>
                            <div  className="onlineAssessmentButton">Assessment Data Review Online</div>
                        </a>
                    </div>
                    <TaxMapForm />
                </div>

                <DocumentList group={group} groupName={group.link} store={store} title='Milton Assessors Documentation' />
                <GroupMembers group={group}  title={' Contacts'}  showTerm={false} showEmail/>

            </Col>
        </Row>
    );
}

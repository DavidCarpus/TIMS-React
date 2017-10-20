import React from 'react';
import { Col, Row } from 'reactstrap';

import  './Assessing.css'
import DocumentList  from '../../../Components/DocumentList'
import RawText from '../../../Components/RawText'
import TaxMapForm  from '../../../Components/TaxMapForm'
import {PageNavbar, addMenu} from '../../../Components/PageNavbar'
import GroupMembers from '../../../Components/GroupMembers'

export default function Assessing({group, store, loading, id, groupMembers, agendasAndMinutes, groupDocuments, groupNotices, title='Assessing Department'}){
    let pageNavMenus=[
        {text:'^^^', target:'primary-content-top'},
    ]
    if (groupMembers.length > 0 ) {
        pageNavMenus = addMenu(pageNavMenus, {text:'Contacts', target:'groupMembers-bookmark', fontAwsomeIcon:'fa-address-book'});
    }
    if (agendasAndMinutes.length > 0 ) {
        pageNavMenus = addMenu(pageNavMenus, {text:'Agendas', target:'AgendasAndMinutes-bookmark', fontAwsomeIcon:'fa-clock-o'});
    }
    if ( groupDocuments.documents.length > 0 ) {
        pageNavMenus = addMenu(pageNavMenus, {text:'Docs', target:'DocumentList-bookmark', fontAwsomeIcon:'fa-file-text'});
    }
    if (groupNotices.length > 0 ) {
        pageNavMenus = addMenu(pageNavMenus, {text:'Notices', target:'Notices-bookmark', fontAwsomeIcon:'fa-bell'});
    }

    return (
        <Row id='Assessing'>
            <PageNavbar menus={pageNavMenus}/>

            <Col  md={{size:10, push:1}} >
                <div className="blockSection">
                    <h1 style={{textAlign:'center'}}>{title}</h1>
                    <RawText id='description' groupPageText={group.pagetext} block='description' />
                </div>

                <div id='assessmentAndMaps'>
                    <div  style={{width:'48%'}} >
                        <a href='http://data.avitarassociates.com/logondirect.aspx?usr=milton&pwd=milton'>
                            <div  className="onlineAssessmentButton">Assessment Data Review Online</div>
                        </a>
                    </div>
                    <TaxMapForm />
                </div>

                <DocumentList group={group} groupName={group.link} store={store} title='Milton Assessors Documentation' />
                {(groupMembers.length > 0 ) && <GroupMembers group={group}  title={' Contacts'}  showTerm={false} showEmail/>}

            </Col>
        </Row>
    );
}
// {(this.props.groupMembers.length > 0 ) && <GroupMembers group={this.props.group}  title={' Contacts'} showTerm={false} showEmail/>}

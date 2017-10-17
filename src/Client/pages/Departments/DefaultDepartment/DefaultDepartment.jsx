import React from 'react';
import { Col, Row } from 'reactstrap';

 import DocumentList  from '../../../Components/DocumentList'
 import RawText from '../../../Components/RawText'
 import GroupMembers from '../../../Components/GroupMembers'
 import AgendasAndMinutes from '../../../Components/AgendasAndMinutes'
 import NoticesList from '../../../Components/NoticesList'
 import HelpfulInformation  from '../../../Components/HelpfulInformation'

 import {PageNavbar, addMenu} from '../../../Components/PageNavbar'
 // import GroupMembers from '../../../Components/GroupMembers'

export default function DefaultDepartment({group, store, loading, id, agendasAndMinutes, groupDocuments, title='Default'}){
    let pageNavMenus=[
        {text:'^^^', target:'primary-content-top'},
    ]
    if (typeof agendasAndMinutes !== 'undefined' && Object.keys(agendasAndMinutes).length > 0 ) {
        pageNavMenus = addMenu(pageNavMenus, {text:'Agendas', target:'AgendasAndMinutes-bookmark', fontAwsomeIcon:'fa-clock-o'});
    }

    if (typeof groupDocuments !== 'undefined' && Object.keys(groupDocuments).length > 0 ) {
        pageNavMenus = addMenu(pageNavMenus, {text:'Docs', target:'DocumentList-bookmark', fontAwsomeIcon:'fa-file-text'});
    }
    //     pageNavMenus = addMenu(pageNavMenus, {text:'Notices', target:'Notices-bookmark', fontAwsomeIcon:'fa-bell'});

    return (
        <Row id='DefaultDepartment'>
            <PageNavbar menus={pageNavMenus}/>

            <Col  md={{size:10, push:1}}>
                <div className="blockSection">
                    <h1 style={{textAlign:'center'}}>{title}</h1>
                    <RawText id='description' groupPageText={group.pagetext} block='description' />
                </div>

                <GroupMembers group={group}  title={' Contacts'}  showTerm={false} />

                <AgendasAndMinutes  group={group} store={store}  agendasAndMinutes={agendasAndMinutes}/>
                <NoticesList group={group} store={store} />
                <DocumentList group={group} store={store}  groupDocuments={groupDocuments}/>
                <HelpfulInformation informationArray={group.helpfulinformation || []} />
            </Col>
        </Row>
    )
}

// <HelpfulInformation informationArray={group.helpfulinformation || []} />
// <DocumentList group={group} store={store} title='CoppleCrownVillage' />
// <GroupMembers group={group}  title={' Contacts'}  showTerm={false} />

// <h1 style={{textAlign:'center'}}>Code Enforcement</h1>
// <RawText groupPageText={ group.pagetext} block='description' />

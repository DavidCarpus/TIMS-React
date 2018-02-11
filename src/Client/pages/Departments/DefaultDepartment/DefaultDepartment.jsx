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

export default function DefaultDepartment({group, store, loading, id, agendasAndMinutes, groupDocuments, groupMembers, groupNotices, title='Default'}){
    let pageNavMenus=[ {text:'^^^', target:'primary-content-top', hoverText:'Top'}]
    if (groupNotices.length > 0 ) {
        pageNavMenus = addMenu(pageNavMenus, {text:'Notices', target:'Notices-bookmark', fontAwsomeIcon:'fa-bell'});
    }
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
        <Row id='DefaultDepartment'>
            <PageNavbar menus={pageNavMenus}/>

            <Col  md={{size:10, push:1}}>
                <div className="blockSection">
                    <h1 style={{textAlign:'center'}}>{title}</h1>
                        <RawText id='description' groupPageText={group.pagetext} block='description' />
                        <RawText id='description' groupPageText={group.pagetext} block='desc' />
                </div>

                {(groupMembers.length > 0 ) && <GroupMembers group={group}  title={' Contacts'}  showTerm={false} />}
                {(agendasAndMinutes.length > 0 ) &&<AgendasAndMinutes  group={group} store={store}  agendasAndMinutes={agendasAndMinutes}/>}
                {(groupNotices.length > 0 ) && <NoticesList group={group} store={store} />}
                {( groupDocuments.documents.length > 0 )&&<DocumentList group={group} store={store}  groupDocuments={groupDocuments}/>}
                <HelpfulInformation informationArray={group.helpfulinformation || []} />
            </Col>
        </Row>
    )
}

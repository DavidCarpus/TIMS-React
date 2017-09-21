import React from 'react';

import DocumentList  from '../../../Components/DocumentList'
import NoticesList from '../../../Components/NoticesList'
import RawText from '../../../Components/RawText'

import FAQList  from '../../../Components/FAQList'
import { Col, Row } from 'reactstrap';
import GroupMembers from '../../../Components/GroupMembers'
import {PageNavbar} from '../../../Components/PageNavbar'

function pageNav() {
    return (
    <PageNavbar menus={[
        {text:'^^^', target:'primary-content-top'},
        {text:'FAQ', target:'FAQList-bookmark'},
        {text:'Contact', target:'groupMembers-bookmark', fontAwsomeIcon:'fa-address-book'}
        ]}/>
    )
}
export default function Welfare({group, store, loading, id, title='Welfare Department'}){
    return (
        <Row id='Welfare'>
            {pageNav()}
            <Col  md={{size:9, push:2}}>
                <div className="blockSection">
                    <h1 style={{textAlign:'center'}}>{group.description}</h1>
                    <RawText groupPageText={group.pagetext} block='description' />
                </div>
                <NoticesList group={group} store={store} groupName={group.Name}/>
                <div className="blockSection">
                    <RawText groupPageText={group.pagetext } block='text1' />
                </div>
                <DocumentList group={group}  groupName={group.link}  store={store}/>
                <FAQList group={group} groupName={group.link}  store={store}/>
                <GroupMembers group={group}  title={' Contacts'}  showTerm={false} showEmail />
            </Col>
        </Row>
    );
}

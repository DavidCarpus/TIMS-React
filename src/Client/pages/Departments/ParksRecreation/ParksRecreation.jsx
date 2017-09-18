import React from 'react';
import { Col, Row } from 'reactstrap';

import EB2ServiceBlock from '../../../Components/EB2ServiceBlock'
import NoticesList from '../../../Components/NoticesList'
import DocumentList from '../../../Components/DocumentList'
import TownNewsletters from '../../../Components/TownNewsletters'
import RawText from '../../../Components/RawText'
// import Slideshow from '../../../Components/Slideshow'
import GroupMembers from '../../../Components/GroupMembers'
import PageNavbar from '../../../Components/PageNavbar'

// <Slideshow/>

function pageNav() {
    return (
    <PageNavbar menus={[
            {text:'^^^', target:'primary-content-top'},
            {text:'Doc', target:'DocumentList-bookmark'},
            {text:'Contact', target:'groupMembers-bookmark'}
        ]}/>
    )
}

export default function ParksRecreation({group, store, loading, id, title='Parks and Recreation'}){
    return (
        <Row id='ParksRecreation'>
            {pageNav()}
            <Col  md={{size:10, push:1}}>
                <div className="blockSection">
                    <h1 style={{textAlign:'center'}}>{title}</h1>
                    <RawText groupPageText={group.pagetext } block='description' />
                    <EB2ServiceBlock groupName={group.link}/>
                </div>


                <NoticesList group={group} store={store} groupName={group.link}/>
                <DocumentList group={group} store={store} />

                <TownNewsletters title={'Milton Town Gazette'} group={group} store={store} />
                <GroupMembers group={group}  title={' Contacts'}  showTerm={false} showEmail />

                </Col>
        </Row>
    );

}

import React from 'react';
import { Col, Row } from 'reactstrap';

import SmartLink from '../../../Components/SmartLink'
import DocumentList  from '../../../Components/DocumentList'
import RawText from '../../../Components/RawText'
import GroupMembers from '../../../Components/GroupMembers'
import PageNavbar from '../../../Components/PageNavbar'

function pageNav() {
    return (
    <PageNavbar menus={[
            {text:'^^^', target:'primary-content-top'},
            {text:'Doc', target:'DocumentList-bookmark'},
            {text:'Contacts', target:'groupMembers-bookmark'}
        ]}/>
    )
}

export default function Sewer({group, store, loading, id, title='Sewer Department'}){
    return (
        <Row id='Sewer'>
            {pageNav()}
            <Col  md={{size:10, push:1}}>
                <div className="blockSection">
                    <h1 style={{textAlign:'center'}}>{title}</h1>

                    <RawText groupPageText={group.pagetext} block='description' />
                    <SmartLink link='http://des.nh.gov/index.htm' linkText=' ** NH Department of Environmental Services (DES)'/>
                </div>

                    <DocumentList group={group} store={store} title='Milton Sewage Department Documentation' />
                    <GroupMembers group={group}  title={' Contacts'}  showTerm={false} />
                </Col>
        </Row>
    )
}

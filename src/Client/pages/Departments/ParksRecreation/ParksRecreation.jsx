import React from 'react';
import { Col, Row } from 'reactstrap';

import Aside from '../../../Components/Aside'
import EB2ServiceBlock from '../../../Components/EB2ServiceBlock'
import NoticesList from '../../../Components/NoticesList'
import DocumentList from '../../../Components/DocumentList'
import TownNewsletters from '../../../Components/TownNewsletters'
import RawText from '../../../Components/RawText'
import Slideshow from '../../../Components/Slideshow'

export default function ParksRecreation({group, store, loading, id, title='Parks and Recreation'}){
    return (
        <Row id='ParksRecreation'>
            <Col  md={{size:9, push:3}} id='contentArea'>
                <h1 style={{textAlign:'center'}}>{title}</h1>
                <RawText groupPageText={group.pagetext } block='description' />
                <Slideshow/>
                <EB2ServiceBlock groupName={group.link}/>

                <NoticesList group={group} store={store} groupName={group.link}/>
                <DocumentList group={group} store={store} />

                <TownNewsletters title={'Milton Town Gazette'} group={group} store={store} />
                </Col>
            <Col md={{size:3, pull:9}}> <Aside group={group} store={store} /> </Col>
        </Row>
    );

}

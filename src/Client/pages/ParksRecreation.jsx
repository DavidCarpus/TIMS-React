import React from 'react';
import { Col } from 'react-bootstrap';

import Aside from '../Components/Aside'
import EB2ServiceBlock from '../Components/EB2ServiceBlock'
import NoticesList from '../Components/NoticesList'
import DocumentList from '../Components/DocumentList'
import TownNewsletters from '../Components/TownNewsletters'
import RawText from '../Components/RawText'

export default function ParksRecreation({group, store, loading, id, title='Parks and Recreation'}){
    return (
        <div>
            <Col md={9}  mdPush={2} id="contentArea"  >
                <h1 style={{textAlign:'center'}}>{title}</h1>
                <RawText groupPageText={group.pagetext } block='description' />
                <EB2ServiceBlock groupName={group.link}/>

                <NoticesList group={group} store={store} groupName={group.link}/>
                <DocumentList group={group} store={store} />

                <TownNewsletters title={'Milton Town Gazette'} group={group} store={store} />
            </Col>
            <Col md={2} mdPull={9}><Aside group={group} store={store}/></Col>
        </div>
    );

}

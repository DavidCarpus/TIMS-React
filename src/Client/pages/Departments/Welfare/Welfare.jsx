import React from 'react';
import Aside from '../../../Components/Aside'

// import SmartLink from '../Components/SmartLink'
import DocumentList  from '../../../Components/DocumentList'
import NoticesList from '../../../Components/NoticesList'
import RawText from '../../../Components/RawText'

import FAQList  from '../../../Components/FAQList'
import { Col, Row } from 'reactstrap';

export default function Welfare({group, store, loading, id, title='Welfare Department'}){
    return (
        <Row id='Welfare'>
            <Col  md={{size:9, push:2}} id='contentArea'>
            <h1 style={{textAlign:'center'}}>{group.description}</h1>
                    <RawText groupPageText={group.pagetext} block='description' />
                    <NoticesList group={group} store={store} groupName={group.Name}/>
                    <RawText groupPageText={group.pagetext } block='text1' />
                    <DocumentList group={group}  groupName={group.link}  store={store}/>
                    <FAQList group={group} groupName={group.link}  store={store}/>
                    </Col>
                <Col md={{size:2, pull:9}}> <Aside group={group} store={store} /> </Col>
            </Row>

    );

}

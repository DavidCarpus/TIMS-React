import React from 'react';
import { Col, Row } from 'reactstrap';

 import Aside from '../../../Components/Aside'
 import DocumentList  from '../../../Components/DocumentList'
 import RawText from '../../../Components/RawText'
 import HelpfulInformation  from '../../../Components/HelpfulInformation'

export default function CodeEnforcement({group, store, loading, id, title='Code Enforcement'}){
        return (
            <Row id='CodeEnforcement'>
                <Col  md={{size:9, push:3}} id='contentArea'>
                    <h1 style={{textAlign:'center'}}>Code Enforcement</h1>
                    <RawText groupPageText={ group.pagetext} block='description' />

                    <HelpfulInformation informationArray={group.helpfulinformation || []} />
                    <DocumentList group={group} store={store} title='Milton Code Enforcement Documentation' />
                    </Col>
                <Col md={{size:3, pull:9}}> <Aside group={group} store={store} /> </Col>
            </Row>
        )

}

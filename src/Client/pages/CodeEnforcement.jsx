import React from 'react';
 import {  Col } from 'react-bootstrap';

 import Aside from '../Components/Aside'
 import DocumentList  from '../Components/DocumentList'
 import RawText from '../Components/RawText'
 import HelpfulInformation  from '../Components/HelpfulInformation'

export default function CodeEnforcement({group, store, loading, id, title='Code Enforcement'}){
        return (
            <div>
                <Col md={9}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Code Enforcement</h1>
                    <RawText groupPageText={ group.pagetext} block='description' />

                    <HelpfulInformation informationArray={group.helpfulinformation || []} />
                    <DocumentList group={group} store={store} title='Milton Code Enforcement Documentation' />
                </Col>
                <Col md={2} mdPull={9}><Aside group={group} store={store} /></Col>
            </div>
        )

}

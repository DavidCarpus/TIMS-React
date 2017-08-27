import React from 'react';
import { Col, Row } from 'reactstrap';

import  './Assessing.css'
import Aside from '../../../Components/Aside'
import DocumentList  from '../../../Components/DocumentList'
import RawText from '../../../Components/RawText'
import TaxMapForm  from '../../../Components/TaxMapForm'

export default function Assessing({group, store, loading, id, title='Assessing Department'}){
    return (
        <Row id='Assessing'>
            <Col  md={{size:8, push:3}} id='contentArea'>
                <h1 style={{textAlign:'center'}}>{title}</h1>
                <RawText groupPageText={group.pagetext} block='description' />

                <div >
                    <div  style={{width:'48%'}}>
                        <a href='http://data.avitarassociates.com/logondirect.aspx?usr=milton&pwd=milton'>
                            <div  className="onlineAssessmentButton">Assessment Data Review Online</div>
                        </a>
                    </div>
                    <TaxMapForm />
                </div>

                <DocumentList group={group} groupName={group.link} store={store} title='Milton Assessors Documentation' />
            </Col>
            <Col md={{size:3, pull:8}}> <Aside group={group} store={store} /> </Col>
        </Row>
    );

}
/*
<Col md={2} mdPull={9}> <Aside group={group} store={store} /> </Col>

*/

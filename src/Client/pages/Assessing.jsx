import React from 'react';
import { Col } from 'react-bootstrap';

import  './Assessing.css'
import Aside from '../Components/Aside'
import DocumentList  from '../Components/DocumentList'
import RawText from '../Components/RawText'
import TaxMapForm  from '../Components/TaxMapForm'

export default function Assessing({group, store, loading, id, title='Assessing Department'}){
    return (
        <div>
            <Col md={9}  mdPush={2} id="contentArea"  >
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

                <Col md={2} mdPull={9}> <Aside group={group} store={store} /> </Col>
        </div>
    );

}

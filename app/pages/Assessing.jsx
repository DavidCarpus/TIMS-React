import React from 'react';
import { Col } from 'react-bootstrap';

import styles from '../assets/Styles/Assessing.css'
import Aside from '../Containers/Aside'
import DocumentList  from '../Containers/DocumentList'
import RawText from '../Components/RawText'
import TaxMapForm  from '../Components/TaxMapForm'

export default class Assessing extends React.Component {

    render() {
        var group = this.props.group;
        var groupPageText = group.pagetext;

        return (
            <div>
                <Col md={10}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Assessing Department</h1>
                    <RawText groupPageText={groupPageText} block='desc' />

                    <div >
                        <div  style={{width:'48%'}}>
                            <a href='http://data.avitarassociates.com/logondirect.aspx?usr=milton&pwd=milton'>
                                <div  className={styles.onlineAssessmentButton}>Assessment Data Review Online</div>
                            </a>
                        </div>
                        <TaxMapForm />
                    </div>

                    <DocumentList
                        group={group}
                        groupName={group.link}
                        title='Milton Assessors Documentation'
                        />
                    </Col>
                    <Col md={2} mdPull={10}><Aside group={group} /></Col>
            </div>

        );
    }
}

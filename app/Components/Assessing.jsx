import React from 'react';
import TaxMapForm  from './TaxMapForm'
import styles from './Assessing.css'
import Aside from './Aside'

import data from './Data/Assessing.json'
import layoutStyles from './MainLayout.css'

var asideData = data.asideData
var documents = data.documents

export default class Assessing extends React.Component {

    render() {
        return (
            <div id="Assessing">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Assessing Department</h1>
                    <p>The Assessing Department is charged by State law with discovering, describing, and valuing real property for taxation purposes. The Department's job is diverse and involves the following responsibilities:</p>
                    <ul>
                        <li>Appraise and assess all real estate    </li>
                        <li>Monitor all sales and analyze the local real estate market </li>
                        <li>Maintain Property Record Card data </li>
                        <li>Administer Current Use Program </li>
                        <li>Oversee all Tax Exemption and Tax Credit Programs </li>
                        <li>Manage Timber Tax and Gravel Tax Programs </li>
                        <li>Assist taxpayers and the general public </li>
                        <li>Maintain Town's assessment roll by valuation of additions and new construction </li>
                        <li>Administer Tax Abatements </li>
                        <li>Provide assistance to other departments as needed </li>
                    </ul>
                    <div >
                    <div  style={{width:'48%'}}>
                        <a href='http://data.avitarassociates.com/logondirect.aspx?usr=milton&pwd=milton'>
                            <div className={styles.onlineAssessmentButton}>Assessment Data Review Online</div>
                        </a>
                    </div>
                    <TaxMapForm />
                    </div>

                    <h2>Milton Assessor's Documentation</h2>
                    {documents.
                        sort((a, b) => {
                        return new Date(b.date) - new Date(a.date);
                        }).
                        map( (document, index) =>
                            <div>{document.dateDesc} - {document.desc} </div>
                        )}

                </div>
                <Aside data={asideData}/>
            </div>
        );
    }

}

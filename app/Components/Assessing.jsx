import React from 'react';
import MainNotices from './MainNotices'
import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import TaxMapForm  from './TaxMapForm'
import styles from './Assessing.css'
import Aside from './Aside'
import data from './Data/Assessing.json'

var asideData = data.asideData

export default class About extends React.Component {

render() {
    return (
        <div id="mainScreen">
            <h1 style={{textAlign:'center'}}>Assessing Department</h1>
The Assessing Department is charged by State law with discovering, describing, and valuing real property for taxation purposes. The Department's job is diverse and involves the following responsibilities:

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

<div  style={{width:'48%', display:'inline-block'}}>
    <a href='http://data.avitarassociates.com/logondirect.aspx?usr=milton&pwd=milton'>
        <div className={styles.onlineAssessmentButton}>Assessment Data Review Online</div>
    </a>
</div>
<TaxMapForm />

<Aside data={asideData}/>

</div>
    );
}

}
// <a href='http://data.avitarassociates.com/logondirect.aspx?usr=milton&pwd=milton'>
// <img src='http://miltonnh-us.com/uploads/assessing_18_1088354971.jpg' />
// </a>

// <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. </p>
// <br/>

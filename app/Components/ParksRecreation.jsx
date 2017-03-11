import React from 'react';
import MainNotices from './MainNotices'
import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import TaxMapForm  from './TaxMapForm'
import styles from './Assessing.css'
import Aside from './Aside'
import data from './Data/ParksRecreation.json'

var asideData = data.asideData
var notices = data.notices

export default class ParksRecreation extends React.Component {

render() {
    return (
        <div id="mainScreen">
            <h1 style={{textAlign:'center'}}>Parks and Recreation</h1>
Town Beach is open Saturday's & Sunday's weather permitting 10-5pm.
Please call ahead to verify that the gatehouse is open.
603-652-7308

<h2>Events/Notices</h2>
{notices.
    sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
        // return a.date - b.date;
    }).
    map((notice, index) =>
    <div key={index}>{notice.date} - {notice.desc}<br/></div>
    )}

<Aside data={asideData}/>
</div>
    );
}
}
/*
{notices.map((notice, index) =>
    <div key={index}>{notices.desc}<br/></div>
    )}
*/
// <div key={index}><a href={notices.link}>{notices.desc}</a><br/></div>

// <a href='http://data.avitarassociates.com/logondirect.aspx?usr=milton&pwd=milton'>
// <img src='http://miltonnh-us.com/uploads/assessing_18_1088354971.jpg' />
// </a>

// <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. </p>
// <br/>

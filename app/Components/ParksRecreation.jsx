import React from 'react';
import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import TaxMapForm  from './TaxMapForm'
import Aside from './Aside'
import EB2ServiceLink from './EB2ServiceLink'

import styles from './Assessing.css'
import layoutStyles from './MainLayout.css'

import data from './Data/ParksRecreation.json'

import servicesData from './Data/EB2Services.json'
var services = servicesData.services

var asideData = data.asideData
var notices = data.notices
var gazette = data.gazette

class GazetteListing extends React.Component {
    render() {
        return (
            <div>
                <h2>Milton Town Gazette</h2>
                <ul>
                    {gazette.
                        sort((a, b) => {
                        return new Date(b.date) - new Date(a.date);
                        }).
                        map((entry, index) =>
                        <div key={index}>
                            <li>
                                <a href={entry.link}>{entry.desc} Gazette</a>
                            </li>
                        </div>
                    )}
                    </ul>
                </div>
        )
    }
}
// http://miltonnh-us.com/uploads/parks_297_738096610.pdf

export default class ParksRecreation extends React.Component {
    render() {
        return (
            <div id="CodeEnforcement">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Parks and Recreation</h1>
                        <p>Town Beach is open Saturday's & Sunday's weather permitting 10-5pm.
                            Please call ahead to verify that the gatehouse is open.
                            603-652-7308
                            </p>

                        <ul style={{listStyleType: 'none'}}>
                            {services.filter( (service)=> {return service.dept == 'parks'} ).
                                map( (service, index) =>
                                    <EB2ServiceLink key={index} service={service}/>
                                )}
                        </ul>

                    <h2>Events/Notices</h2>
                    <ul>
                        {notices.
                            sort((a, b) => {
                            return new Date(b.date) - new Date(a.date);
                            }).
                            map((notice, index) =>
                            <div key={index}><li>{notice.date} - {notice.desc}</li></div>
                        )}
                    </ul>
                        <GazetteListing />
                </div>
                <Aside data={asideData} className={layoutStyles.primaryAside}/>
            </div>
        );
    }
}

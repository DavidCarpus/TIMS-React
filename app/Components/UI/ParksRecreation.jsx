import React from 'react';
import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import TaxMapForm  from './TaxMapForm'
import Aside from './Aside'
import EB2ServiceLink from './EB2ServiceLink'
import EB2ServiceBlock from './EB2ServiceBlock'
import NoticesList from './NoticesList'

import { Grid, Row, Col } from 'react-bootstrap';

import data from '../Data/ParksRecreation.json'
import notices from '../Data/Notices.json'

import servicesData from '../Data/EB2Services.json'
var services = servicesData.services
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
            <div>
                <Col md={2}><Aside groupName={'ParksRecreation'} /></Col>
                <Col md={10}  id="contentArea" >
                    <h1 style={{textAlign:'center'}}>Parks and Recreation</h1>
                    <p>Town Beach is open Saturday's & Sunday's weather permitting 10-5pm.
                    Please call ahead to verify that the gatehouse is open.
                    603-652-7308
                    </p>
                    <EB2ServiceBlock groupName='ParksRecreation'/>
                    <NoticesList notices={notices.filter((notice)=> {return notice.dept == 'ParksRecreation'})}/>
                    <GazetteListing />
                </Col>
            </div>
        );
    }
}

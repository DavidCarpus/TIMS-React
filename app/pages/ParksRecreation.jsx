import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Aside from '../Containers/Aside'

import TaxMapForm  from '../Components/TaxMapForm'
import EB2ServiceBlock from '../Containers/EB2ServiceBlock'

import NoticesList from '../Containers/NoticesList'
import TownNewsletters from '../Containers/TownNewsletters'
import organizations from '../Data/OrganizationalUnits.json'

export default class ParksRecreation extends React.Component {
    render() {
        // var groupName='ParksRecreation'
        var group = organizations.filter( (organization)=>
            {return organization.link == 'ParksRecreation' } )[0]
        return (
            <div>
                <Col md={10}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Parks and Recreation</h1>
                    <p>Town Beach is open Saturday's & Sunday's weather permitting 10-5pm.
                    Please call ahead to verify that the gatehouse is open.
                    603-652-7308
                    </p>
                    <EB2ServiceBlock groupName={group.link}/>
                    <NoticesList groupName={group.link}/>

                    <TownNewsletters />
                </Col>
                <Col md={2} mdPull={10}><Aside group={group} groupName={group.link} /></Col>

            </div>
        );
    }
}

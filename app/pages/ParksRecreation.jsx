import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Aside from '../Containers/Aside'

import TaxMapForm  from '../Components/TaxMapForm'
import EB2ServiceBlock from '../Containers/EB2ServiceBlock'

import NoticesList from '../Containers/NoticesList'
import TownNewsletters from '../Containers/TownNewsletters'

export default class ParksRecreation extends React.Component {
    render() {
        var groupName='ParksRecreation'
        return (
            <div>
                <Col md={10}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Parks and Recreation</h1>
                    <p>Town Beach is open Saturday's & Sunday's weather permitting 10-5pm.
                    Please call ahead to verify that the gatehouse is open.
                    603-652-7308
                    </p>
                    <EB2ServiceBlock groupName={groupName}/>
                    <NoticesList groupName={groupName}/>

                    <TownNewsletters />
                </Col>
                <Col md={2} mdPull={10}><Aside groupName={groupName} /></Col>

            </div>
        );
    }
}

import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Aside from '../Containers/Aside'

import TaxMapForm  from '../Components/TaxMapForm'
import EB2ServiceBlock from '../Containers/EB2ServiceBlock'
import RawText from '../Components/RawText'

import NoticesList from '../Containers/NoticesList'
import TownNewsletters from '../Containers/TownNewsletters'
import organizations from '../Data/OrganizationalUnits.json'

export default class ParksRecreation extends React.Component {
    render() {
        var group = organizations.filter( (organization)=>
            {return organization.link == 'ParksRecreation' } )[0]
        return (
            <div>
                <Col md={10}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Parks and Recreation</h1>
                    <RawText groupPageText={group.pagetext} block='desc' />

                    <EB2ServiceBlock groupName={group.link}/>
                    <NoticesList
                        group={group}
                        groupName={group.link}/>

                    <TownNewsletters title={'Milton Town Gazette'} group={group} />
                </Col>
                <Col md={2} mdPull={10}><Aside group={group}  /></Col>

            </div>
        );
    }
}

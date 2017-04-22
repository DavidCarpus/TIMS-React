import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Aside from '../Containers/Aside'

import SmartLink from '../Components/SmartLink'
import PlanningMapsForm from '../Components/PlanningMapsForm'

import DocumentList  from '../Containers/DocumentList'
import GroupMembers from '../Containers/GroupMembers'
import AgendasAndMinutes from '../Containers/AgendasAndMinutes'
import organizations from '../Data/OrganizationalUnits.json'
import RawText from '../Components/RawText'

export default class PlanningBoard extends React.Component {

    render() {
        var group = organizations.filter( (organization)=>
            {return organization.link == 'PlanningBoard' } )[0]
        // var group = this.props.group;
        // var groupPageText = group.pagetext;

        return (
            <Row id="PlanningBoard" className="show-grid">
                <Col md={10}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>{group.desc}</h1>
                    <RawText groupPageText={group.pagetext} block='desc' />

                    <PlanningMapsForm/>

                    <GroupMembers group={group} groupName={group.link} title={group.label + ' Members'} />
                    <AgendasAndMinutes
                        groupName={group.link}
                        group={group}
                        />


                    <DocumentList
                        group={group}
                        title='Planning Board Documentation'
                        />
            </Col>
            <Col md={2} mdPull={10}><Aside group={group} Name={group.link} /></Col>
        </Row>
        );
    }

}
/*
<GroupMembers
    groupName='PlanningBoard'
    title='Planning Board Members'
    />
*/

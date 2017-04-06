import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Aside from '../Containers/Aside'

import SmartLink from '../Components/SmartLink'
import PlanningMapsForm from '../Components/PlanningMapsForm'

import DocumentList  from '../Containers/DocumentList'
import GroupMembers from '../Containers/GroupMembers'
import AgendasAndMinutes from '../Containers/AgendasAndMinutes'

export default class PlanningBoard extends React.Component {

    render() {
        return (
            <Row id="PlanningBoard" className="show-grid">
                <Col md={2}><Aside groupName={'PlanningBoard'} /></Col>
                <Col md={10}  id="contentArea" >
                    <h1 style={{textAlign:'center'}}>Planning Board</h1>

<p>The Milton Planning Board meets on the first and third Tuesdays of the month (as needed, please check schedule to confirm meeting times) to process applications, discuss potential changes to ordinances and regulations, and to also keep up to date on the happenings in the town to confirm that they conform to town regulations. Approval from the Planning Board is required for all subdivisions, lot line adjustments, new non-residential development and expansions or changes of use to non-residential buildings or sites. Abutters play a crucial role by providing information and in helping the Planning Board evaluate plans. Abutters and other citizens interested in a project are encouraged to call the Planning Office with concerns or comments, view the plans at the Town Hall, Land Use Office, submit written comments, or attend the Planning Board meeting.    </p>
<p>The Planning Board is pleased to have the part time assistance of Bruce W. Woodruff, Planning, land use & Development Consultant, in capital improvement program, site plan and subdivision application review and other Land Use issues that may come before the Board.</p>
<p>For additional information, please contact Dana Crossley, Land Use Clerk at 603-652-4501 ext 5</p>

                    <PlanningMapsForm/>

                    <GroupMembers
                        groupName='PlanningBoard'
                        title='Planning Board Members'
                        />
                    <AgendasAndMinutes
                        groupName='PlanningBoard'
                        />


                    <DocumentList
                        groupName='PlanningBoard'
                        title='Planning Board Documentation'
                        />
            </Col>
        </Row>
        );
    }

}

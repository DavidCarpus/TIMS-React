import React from 'react';
import DocumentList  from './DocumentList'
import Aside from './Aside'
import SmartLink from './SmartLink'
import PlanningMapsForm from './PlanningMapsForm'
import layoutStyles from './MainLayout.css'

import GroupMembers from './GroupMembers'
import AgendasAndMinutes from './AgendasAndMinutes'

export default class PlanningBoard extends React.Component {

    render() {
        return (
            <div id="PlanningBoard">
                <div id="contentArea"  className={layoutStyles.contentArea}>
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
                </div>
            <Aside groupName='PlanningBoard' />
            </div>
        );
    }

}

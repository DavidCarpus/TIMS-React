import React from 'react';
import DocumentList  from './DocumentList'
import Aside from './Aside'
import SmartLink from './SmartLink'
import layoutStyles from './MainLayout.css'

import GroupMembers from './GroupMembers'
import AgendasAndMinutes from './AgendasAndMinutes'

export default class BudgetCommittee extends React.Component {

    render() {
        return (
            <div id="BudgetCommittee">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Budget Committee</h1>

                    <GroupMembers
                        groupName='BudgetCommittee'
                        title='Budget Committee Members'
                        />
                    <AgendasAndMinutes
                        groupName='BudgetCommittee'
                        />


                    <DocumentList
                        groupName='BudgetCommittee'
                        title='Budget Committee Documentation'
                        />
                </div>
            <Aside groupName='BudgetCommittee' />
            </div>
        );
    }

}

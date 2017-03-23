import React from 'react';
import DocumentList  from './DocumentList'
import Aside from './Aside'
import SmartLink from './SmartLink'
import layoutStyles from './MainLayout.css'

import GroupMembers from './GroupMembers'
import AgendasAndMinutes from './AgendasAndMinutes'

export default class SewerCommission extends React.Component {

    render() {
        return (
            <div id="SewerCommission">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Sewer Commission</h1>

                    <GroupMembers
                        groupName='SewerCommission'
                        title='Sewer Commission Members'
                        />
                    <AgendasAndMinutes
                        groupName='SewerCommission'
                        />


                    <DocumentList
                        groupName='SewerCommission'
                        title='Sewer Commission Documentation'
                        />
                </div>
            <Aside groupName='SewerCommission' />
            </div>
        );
    }

}

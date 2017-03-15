import React from 'react';
import DocumentList  from './DocumentList'
import Aside from './Aside'
import SmartLink from './SmartLink'
import layoutStyles from './MainLayout.css'
import AgendasAndMinutes from './AgendasAndMinutes'

export default class CemeteryTrustees extends React.Component {

    render() {
        return (
            <div id="CemeteryTrustees">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Cemetery Trustees</h1>

                    <DocumentList
                        groupName='CemeteryTrustees'
                        title='Milton Cemetery Trustees Documentation'
                        />
                    <AgendasAndMinutes
                        groupName='CemeteryTrustees'
                        />

                </div>
            <Aside groupName='CemeteryTrustees' />
            </div>
        );
    }

}

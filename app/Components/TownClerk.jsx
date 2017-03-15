import React from 'react';
import Aside from './Aside'
import layoutStyles from './MainLayout.css'
import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import styles from './TownClerk.css'
import NoticesList from './NoticesList'
import DocumentList  from './DocumentList'

 import notices from './Data/Notices.json'

export default class TownClerk extends React.Component {
    render() {
        return (
            <div id='TownClerk'>
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Tax Collector/Town Clerk</h1>

                    <NoticesList notices={notices.filter((notice)=> {return notice.dept == 'townclerk'})}/>

                    <OnlinePaymentsBlock/>
                    <p>The Town Clerk/Tax Collector's Office can process Hunting & Fishing Licenses, as well as Boat Registrations.</p>

                        <DocumentList
                            groupName='TownClerk'
                            />

                </div>
                <Aside
                    groupName='TownClerk'
                    />
            </div>
        )
    }
}
// data={asideData}

import React from 'react';
import Aside from './Aside'
import layoutStyles from './MainLayout.css'
import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import styles from './TownClerk.css'
import NoticesList from './NoticesList'

 import data from './Data/TownClerk.json'
 import notices from './Data/Notices.json'
 var asideData =  data.asideData
// var documents = data.documents

export default class TownClerk extends React.Component {
    render() {
        return (
            <div id='TownClerk'>
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Tax Collector/Town Clerk</h1>
                    <p>The Town Clerk/Tax Collector's Office can process Hunting & Fishing Licenses, as well as Boat Registrations.</p>

                    <OnlinePaymentsBlock/>

                    <NoticesList notices={notices.filter((notice)=> {return notice.dept == 'townclerk'})}/>

                </div>
                <Aside data={asideData}/>
            </div>
        )
    }
}

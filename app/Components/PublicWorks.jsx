import React from 'react';
import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import TaxMapForm  from './TaxMapForm'
import styles from './PublicWorks.css'
import Aside from './Aside'
import SmartLink from './SmartLink'
import layoutStyles from './MainLayout.css'
import NoticesList from './NoticesList'
import EB2ServiceLink from './EB2ServiceLink'
import TransferStationRules from './TransferStationRules'

import notices from './Data/Notices.json'
import data from './Data/PublicWorks.json'
import servicesData from './Data/EB2Services.json'
var services = servicesData.services
var asideData =  data.asideData
// var documents = data.documents

export default class PublicWorks extends React.Component {

    render() {
        return (
            <div id="PublicWorks">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Public Works Department</h1>
                        <p>The Public Works Department consists of the Highway Department, Transfer Station, and Government Buildings.</p>
                        <NoticesList notices={notices.filter((notice)=>
                                {return  notice.dept=='pw'})}/>

                        <SmartLink link='http://miltonnh-us.com/uploads/highway_30_2123914888.pdf'
                            linkText='ORDINANCE REGULATING HEAVY HAULING OVER TOWN ROADS'/>


                        <hr/>
                        <h2>Transfer Station</h2>
                        <p>
                            603-652-4125
                            Friday- Monday 7am- 3pm
                            (last load accepted at 2:45pm) Closed Holidays
                        </p>
                    <div className={styles.transferMission}>
                        <h3>"If You Don't Know--Don't Throw, Please Ask"</h3>
                        <h3>Misson Statement</h3>
                        <p>At the Milton Transfer Station our goal is to create a polite and friendly atmosphere while committing to a superior level of service to assist the residents in their recycling and disposal needs.</p>
                    </div>

                    <TransferStationRules/>
                    <hr/>
                        <SmartLink link='/Departments/TransferRules'
                            linkText='Printable Transfer Station Rules'/>
                            <hr/>


                        <ul style={{listStyleType: 'none'}}>
                            {services.filter( (service)=> {return service.dept == 'publicworks'} ).
                                map( (service, index) =>
                                    <EB2ServiceLink key={index} service={service}/>
                                )}
                        </ul>
                        Buy Transfer Station Stickers Online

                </div>

                <Aside data={asideData}/>
            </div>
        );
    }

}
/*
{documents.
    sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
    }).
    map( (document, index) =>
        <div>{document.dateDesc} - {document.desc} </div>
    )}


*/

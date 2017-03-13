import React from 'react';
import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import Aside from './Aside'
import NoticesList from './NoticesList'
import layoutStyles from './MainLayout.css'

var asideData=[
    {'desc': '2017 Town Observed Holidays'},
    {'desc': 'NH Solar Garden Proposal for Lockhart Field'},
    {'desc': 'Starting Thursday, July 28, 2016 there will be a Selectman at the Town Hall Thursday mornings from 8am to 8:30am available to address questions and concerns.'},
    {'desc': 'Notice Letter From Metrocast '},
    {'desc': 'Employment Opportunities & Committee Vacancies'}
]
import notices from './Data/Notices.json'

export default class HomePage extends React.Component {
    render() {
        return (
            <div id="homePage" >

                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <div style={{textAlign:'center'}}>
                        <h1>Welcome to the Town of Milton <br/>New Hampshire</h1>
                        <address >
                        424 White Mountain Highway
                        P.O. Box 310
                        Milton, NH 03851
                        </address>
                        603-652-4501
                    </div>

                    <NoticesList notices={notices.filter((notice)=> {return notice.mainpage})}/>
                    <OnlinePaymentsBlock/>
                </div>
                <Aside data={asideData} className={layoutStyles.primaryAside}/>

            </div>
        );
    }
}

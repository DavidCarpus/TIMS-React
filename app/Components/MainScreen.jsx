import React from 'react';
import MainNotices from './MainNotices'
import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import Aside from './Aside'
// import ReactDOM from 'react-dom';

var asideData=[
    {'desc': '2017 Town Observed Holidays'},
    {'desc': 'NH Solar Garden Proposal for Lockhart Field'},
    {'desc': 'Starting Thursday, July 28, 2016 there will be a Selectman at the Town Hall Thursday mornings from 8am to 8:30am available to address questions and concerns.'},
    {'desc': 'Notice Letter From Metrocast '},
    {'desc': 'Employment Opportunities & Committee Vacancies'}
]

export default class MainScreen extends React.Component {

render() {
    return (
        <div id="mainScreen" style={{textAlign:'center'}}>
            <Aside data={asideData}/>

            <h1 style={{textAlign:'center'}}>Welcome to the Town of Milton <br/>New Hampshire</h1>
            <address style={{textAlign:'center'}}>
            424 White Mountain Highway
            P.O. Box 310
            Milton, NH 03851
        </address>
            <p>603-652-4501</p>                
            <MainNotices/>
            <OnlinePaymentsBlock/>
            <Aside data={asideData}/>

        </div>
    );
}

}

// <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. </p>
// <br/>

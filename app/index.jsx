import React from 'react';
import ReactDOM from 'react-dom';

import HomePage from './pages/HomePage';
import MainLayout from './Components/MainLayout';
import About from './pages/About';
import Calendar from './pages/Calendar'
import Assessing from './pages/Assessing'
import ParksRecreation from './pages/ParksRecreation'
import Planning from './pages/Planning'
import PublicWorks from './pages/PublicWorks'
import Sewer from './pages/Sewer'
import Welfare from './pages/Welfare'
import TownClerk from './pages/TownClerk'
import ContactUs from './pages/ContactUs'
import Employment from './pages/Employment'

import CodeEnforcement from './pages/CodeEnforcement'
import TransferStationRules from './pages/TransferStationRules'
import Committees from './pages/Committees'
import PlanningBoard from './pages/PlanningBoard'


import { Router, Route, IndexRoute, hashHistory } from 'react-router'
var routerHistory = hashHistory;

// if(process.env.NODE_ENV !== 'production') {
//   React.Perf = require('react-addons-perf');
// }
// <Route component={Home} >

ReactDOM.render(
(
      <Router  onUpdate={() => window.scrollTo(0, 0)} history={routerHistory}>
        <Route component={MainLayout}>
                <Route path="/" component={HomePage} />
                <Route path="/about" component={About} />
                <Route path="/calendar" component={Calendar} />
                <Route path="/ContactUs" component={ContactUs} />
                <Route path="/Employment" component={Employment} />


                <Route path="Departments"  >
                    <Route path="Assessing" component={Assessing} />
                    <Route path="CodeEnforcement" component={CodeEnforcement} />
                    <Route path="ParksRecreation" component={ParksRecreation} />
                    <Route path="Planning" component={Planning} />
                    <Route path="PublicWorks" component={PublicWorks} />
                    <Route path="TownClerk" component={TownClerk} />
                    <Route path="Welfare" component={Welfare} />
                    <Route path="TransferRules" component={TransferStationRules} />
                    <Route path="Sewer" component={Sewer} />

                </Route>

                <Route path="BoardsAndCommittees"  >
                    <Route path="PlanningBoard" component={PlanningBoard} />
                </Route>
                <Route path="/BoardsAndCommittees/:commitee" component={Committees}/>

        </Route>
    </Router>
),
 document.getElementById('app') );

/*
<Route path="/TeamMember/:teamMemberID" component={TeamMember}/>
<Route path="/weProjects/:projectID" component={Project}/>

//   <Router  onUpdate={() => window.scrollTo(0, 0)} history={hashHistory}>
// <Route path="/" component={Home}/>
// <Route path="/contact" component={Contact}/>
// </Router>

*/

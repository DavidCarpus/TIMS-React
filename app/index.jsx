import React from 'react';
import ReactDOM from 'react-dom';

import HomePage from './Components/HomePage';
import MainLayout from './Components/MainLayout';
import About from './Components/About';
import Calendar from './Components/Calendar'
import Assessing from './Components/Assessing'
import ParksRecreation from './Components/ParksRecreation'
import Planning from './Components/Planning'
import PublicWorks from './Components/PublicWorks'
import Sewer from './Components/Sewer'
import Welfare from './Components/Welfare'
import TownClerk from './Components/TownClerk'
import ContactUs from './Components/ContactUs'
import Employment from './Components/Employment'

import CodeEnforcement from './Containers/CodeEnforcement'
import TransferStationRules from './Containers/TransferStationRules'
import Committees from './Containers/Committees'
import PlanningBoard from './Components/PlanningBoard'


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

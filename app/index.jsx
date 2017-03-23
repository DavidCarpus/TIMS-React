import React from 'react';
import ReactDOM from 'react-dom';
import HomePage from './Components/UI/HomePage';
import MainLayout from './Components/UI/MainLayout';
import About from './Components/UI/About';
import Calendar from './Components/UI/Calendar'
import Assessing from './Components/UI/Assessing'
import CodeEnforcement from './Components/UI/CodeEnforcement'
import ParksRecreation from './Components/UI/ParksRecreation'
import Planning from './Components/UI/Planning'
import PublicWorks from './Components/UI/PublicWorks'
import TransferStationRules from './Components/UI/TransferStationRules'
import Sewer from './Components/UI/Sewer'
import Welfare from './Components/UI/Welfare'
import TownClerk from './Components/UI/TownClerk'

import Committees from './Components/UI/Committees'
import PlanningBoard from './Components/UI/PlanningBoard'

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

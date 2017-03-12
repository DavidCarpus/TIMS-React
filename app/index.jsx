import React from 'react';
import ReactDOM from 'react-dom';
import HomePage from './Components/HomePage';
import MainLayout from './Components/MainLayout';
import About from './Components/About';
import Calendar from './Components/Calendar'
import Assessing from './Components/Assessing'
import CodeEnforcement from './Components/CodeEnforcement'
import ParksRecreation from './Components/ParksRecreation'

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

                    </Route>
        </Route>
    </Router>
),
 document.getElementById('app') );
 // <Route path="/TeamMember/:teamMemberID" component={TeamMember}/>
 // <Route path="/weProjects/:projectID" component={Project}/>

//   <Router  onUpdate={() => window.scrollTo(0, 0)} history={hashHistory}>
// <Route path="/" component={Home}/>
// <Route path="/contact" component={Contact}/>
// </Router>

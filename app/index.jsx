import React from 'react';
import ReactDOM from 'react-dom';
import Home from './Components/Home';
import TeamMember from './Components/TeamMember';
import Project from './Components/Project';
import { Router, Route, hashHistory } from 'react-router'

if(process.env.NODE_ENV !== 'production') {
  React.Perf = require('react-addons-perf');
}

ReactDOM.render(
(    <Router  onUpdate={() => window.scrollTo(0, 0)} history={hashHistory}>
    <Route path="/" component={Home}/>
    <Route path="/TeamMember/:teamMemberID" component={TeamMember}/>
    <Route path="/weProjects/:projectID" component={Project}/>
    </Router>
),
 document.getElementById('app') );

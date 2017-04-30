import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
var routerHistory = hashHistory;

import HomePage from './pages/HomePage';
import About from './pages/About';
import Calendar from './pages/Calendar'
import ContactUs from './pages/ContactUs'
import Employment from './pages/Employment'
import Login from './pages/Login'

import MainLayout from './Containers/MainLayout';
import TransferRules from './Containers/TransferStationRules'
import Committees from './Containers/Committees'
import Departments from './Containers/Departments'

import {myStore} from './store/myStore.js';

import { fetchOrganizationalUnitData } from './actions/OrganizationalUnitData'
import { fetchPageAsides } from './actions/PageAsides'
import { fetchMeetingDocs, fetchGroupDoc } from './actions/PublicDocuments'

// import Test from './pages/Test'
// <Route path="/Test" component={Test} />
// console.log('myStore:' + JSON.stringify(myStore));

function OrgUnitChange(groupType, store) {
  return (nextState, replace) => {
      var groupName = nextState.params[groupType];
      store.dispatch(fetchOrganizationalUnitData(groupName));
      store.dispatch(fetchPageAsides(groupName));
      store.dispatch(fetchMeetingDocs(groupName));
      store.dispatch(fetchGroupDoc(groupName));
  };
}

export default (
    <Route component={MainLayout}>
            <Route path="/" component={HomePage} groupName='Home' />
            <Route path="/about" component={About} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/ContactUs" component={ContactUs} />
            <Route path="/Employment" component={Employment} />
            <Route path="/Login" component={Login} />


                <Route path="Departments"  >
                    <Route path="TransferRules" component={TransferRules} groupName='TransferRules' />
                </Route>
                <Route path="/Departments/:department" component={Departments} onEnter={OrgUnitChange('department',myStore)} />


            <Route path="/BoardsAndCommittees/:committee" component={Committees} onEnter={OrgUnitChange('committee',myStore)} />

    </Route>
);

/*

*/

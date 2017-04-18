import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
var routerHistory = hashHistory;

import MainLayout from './Components/MainLayout';

import HomePage from './pages/HomePage';
import About from './pages/About';
import Calendar from './pages/Calendar'

import ContactUs from './pages/ContactUs'
import Employment from './pages/Employment'
import PlanningBoard from './pages/PlanningBoard'

import Committees from './pages/Committees'
import Departments from './Containers/Departments'
import {myStore} from './store/myStore.js';

import { fetchOrganizationalUnitData } from './actions/OrganizationalUnitData'

// import Test from './pages/Test'
// <Route path="/Test" component={Test} />
// console.log('myStore:' + JSON.stringify(myStore));

    function onEnterHandler(store) {
      return (nextState, replace) => {
        store.dispatch({
          type: 'CHANGE_DEPARTMENT',
          payload: nextState.params.department
        })
        store.dispatch(fetchOrganizationalUnitData(nextState.params.department))
      };
    }

export default (
    <Route component={MainLayout}>
            <Route path="/" component={HomePage} />
            <Route path="/about" component={About} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/ContactUs" component={ContactUs} />
            <Route path="/Employment" component={Employment} />


            <Route path="Departments/:department" component={Departments} onEnter={onEnterHandler(myStore)}>
            </Route>

            <Route path="BoardsAndCommittees"  >
                <Route path="PlanningBoard" component={PlanningBoard} />
            </Route>
            <Route path="/BoardsAndCommittees/:commitee" component={Committees}/>

    </Route>
);

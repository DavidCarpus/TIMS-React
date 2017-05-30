import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory, hashHistory } from 'react-router';
// import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import routes from './routes';
import configureStore from './store/configureStore.js';
import {myStore} from './store/myStore.js';

// var routerHistory = browserHistory;
var routerHistory = hashHistory;

window.searchRoot = ReactDOM.render(
  <Provider store={myStore}>
    <Router history={routerHistory} routes={routes} />
  </Provider>
  , document.getElementById('app'));

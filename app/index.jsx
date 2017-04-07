import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory, hashHistory } from 'react-router';
import routes from './routes';
import configureStore from './store/configureStore.js';
// import { Router, Route, IndexRoute, hashHistory } from 'react-router'
// var routerHistory = browserHistory;
var routerHistory = hashHistory;

const store = configureStore();


ReactDOM.render(
  <Provider store={store}>
    <Router history={routerHistory} routes={routes} />
  </Provider>
  , document.getElementById('app'));

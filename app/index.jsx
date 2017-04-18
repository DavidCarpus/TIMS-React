import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory, hashHistory } from 'react-router';
import routes from './routes';
import configureStore from './store/configureStore.js';
import {myStore} from './store/myStore.js';
// import store from './store/configureStore.js';

// import publicRecords from './Data/PublicRecords.json'
// import { Router, Route, IndexRoute, hashHistory } from 'react-router'
// var routerHistory = browserHistory;
var routerHistory = hashHistory;
// console.log('myStore:' + JSON.stringify(myStore));

ReactDOM.render(
  <Provider store={myStore}>
    <Router history={routerHistory} routes={routes} />
  </Provider>
  , document.getElementById('app'));

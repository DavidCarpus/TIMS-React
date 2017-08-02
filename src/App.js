import React, { Component } from 'react';
import { Provider } from 'react-redux';

import {myStore} from './Client/store/myStore.js';
import WebApp from './Client/WebApp';

import './App.css';

//https://stackoverflow.com/questions/35849970/accessing-redux-store-from-routes-set-up-via-react-router

class App extends Component {
  render() {
    return (
        <Provider store={myStore}>
            <WebApp  store={myStore}/>
        </Provider>
    );
  }
}

export default App;

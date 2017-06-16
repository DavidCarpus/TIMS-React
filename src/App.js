import React, { Component } from 'react';
import './App.css';
import { Provider } from 'react-redux';
import {
    BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import {myStore} from './Client/store/myStore.js';
import MainLayout from './Client/Components/MainLayout';

//https://stackoverflow.com/questions/35849970/accessing-redux-store-from-routes-set-up-via-react-router

class App extends Component {
    MainLayoutPage = (newProps) => {
        return (
            <MainLayout
                store={myStore}
                {...newProps}
                />
        );
    }

  render() {
    return (
        <Provider store={myStore}>
        <Router >
          <div>
              <Route render={this.MainLayoutPage} />
          </div>
        </Router>
    </Provider>
    );
  }
}

export default App;

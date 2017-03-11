import React from 'react';
import Menu from './Menu'
import MainAside from './MainAside'
// import ReactDOM from 'react-dom';

export default class MainLayout extends React.Component {
  render() {
    return (
      <div className="app">
        <header className="primary-header">
            <Menu/>
        </header>
        <main>
          {this.props.children}
        </main>
      </div>
    );
  }
}

// <li><Link to="/">Home</Link></li>
// <li><Link to="/users">Users</Link></li>
// <li><Link to="/widgets">Widgets</Link></li>

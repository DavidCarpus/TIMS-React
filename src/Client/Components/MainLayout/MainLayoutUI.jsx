import React from 'react';
import { Row, Grid } from 'react-bootstrap';
import Menu from '../Menu/Menu'
import Footer from '../Footer/Footer'
import s from './MainLayoutUI.css'
import {
    Route,
} from 'react-router'

import HomePage from '../../pages/HomePage';
import About from '../../pages/About';
import Calendar from '../../pages/Calendar'
import ContactUs from '../../pages/ContactUs'
import Employment from '../../pages/Employment'
import Login from '../../pages/Login'
import Departments from '../Departments/Departments'
import Committees from '../Committees/CommitteesC'
import TransferStationRules from '../TransferStationRules/TransferStationRulesC'

// function OrgUnitChange(groupType, store) {
//   return (nextState, replace) => {
//       var groupName = nextState.params[groupType];
//       store.dispatch(fetchOrganizationalUnitData(groupName));
//       store.dispatch(fetchPageAsides(groupName));
//       store.dispatch(fetchMeetingDocs(groupName));
//       store.dispatch(fetchGroupDoc(groupName));
//   };
// }


export default class MainLayoutUI extends React.Component {
    CommitteesPage = (newProps) => {
        return (
            <Committees
                fetchOUData={this.props.fetchOUData}
                store={this.props.store}
                {...newProps}
                />
        );
    }
    DepartmentsPage = (newProps) => {
        // console.log('newProps:', newProps);
        // if (newProps.match.params.department === 'TransferRules') {
        //     newProps.match.params.department = 'PublicWorks'
        // }
        return (
            <Departments
                fetchOUData={this.props.fetchOUData}
                store={this.props.store}
                {...newProps}
                />
        );
    }
    componentWillMount() {
        this.props.fetchData();
    }
  render() {
      return (
          <Grid id="MainLayoutUI" className={s.body}>
              <Row className="show-grid">
                  <header id="primary-header"
                       className='content row'>
                      <Menu menus={this.props.MainMenus}/>
                  </header>
              </Row>
              <Row id='MainLayoutUI' className="show-grid">
                  <main id="primaryArea" >
                      <Route exact path="/" render={(newProps)=>( <HomePage store={this.props.store} {...newProps} /> )} />
                      <Route path="/about" render={(newProps)=>( <About store={this.props.store} {...newProps} /> )} />
                      <Route path="/calendar" component={Calendar} />
                      <Route path="/ContactUs" component={ContactUs} />
                      <Route path="/Employment" component={Employment} />
                      <Route path="/Login" component={Login} />
                      <Route path="/TransferRules" render={(newProps)=>( <TransferStationRules store={this.props.store} {...newProps} /> )} />
                      <Route path="/Departments/:department" render={this.DepartmentsPage} />
                      <Route path="/BoardsAndCommittees/:committee" render={this.CommitteesPage} />
                  </main>
              </Row>
              <Row id='footer' className="show-grid">
                  <Footer/>
              </Row>
          </Grid>
      );
  }
}
/*
<Route path="/Departments/:department" component={Departments} onEnter={OrgUnitChange('department',myStore)} />
*/
//{this.props.children}

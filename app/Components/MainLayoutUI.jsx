import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Menu from './Menu'
import Footer from './Footer'
import s from '../Styles/MainLayoutUI.css'

export default class MainLayoutUI extends React.Component {
    componentWillMount() {
        this.props.fetchData();
    }

    // <Grid id="mainLayout" className='container'>
  render() {
      return (
          <Grid id="MainLayoutUI" className={s.body}>
              <Row className="show-grid">
                  <header id="primary-header"
                       className='content row'>
                      <Menu menus={this.props.MainMenus}/>
                  </header>
              </Row>
              <Row id={this.props.routes.location} className="show-grid">
                  <main id="primaryArea" >
                      {this.props.children}
                  </main>
              </Row>
              <Row id='footer' className="show-grid">
                  <Footer/>
              </Row>
          </Grid>
      );
  }
}

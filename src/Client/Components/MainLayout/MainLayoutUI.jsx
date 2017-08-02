import React from 'react';
import { Row, Grid } from 'react-bootstrap';
import Menu from '../Menu/Menu'
import Footer from '../Footer/Footer'
import s from './MainLayoutUI.css'

export default class MainLayoutUI extends React.Component {
  render() {
      return (
          <Grid id="MainLayoutUI" className={s.body}>
              <Row className="show-grid">
                  <header id="primary-header">
                      <Menu menus={this.props.MainMenus}/>
                  </header>
              </Row>
              <Row id='MainLayoutUI' >
                  <main id="primaryArea" >
                      {this.props.children}
                  </main>
              </Row>
              <Row className="show-grid">
                  <Footer/>
              </Row>
          </Grid>
      );
  }
}

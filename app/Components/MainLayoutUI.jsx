import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Menu from './Menu'
import Footer from './Footer'

export default class MainLayoutUI extends React.Component {
    componentWillMount() {
        this.props.fetchData();
    }

  render() {
      return (
          <Grid id="mainLayout" className='container'>
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

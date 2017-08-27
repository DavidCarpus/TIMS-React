import React from 'react';
// import { Row, Grid } from 'react-bootstrap';
import { Row,Container } from 'reactstrap';

import Menu from '../Menu/Menu'
import Footer from '../Footer/Footer'
import  './MainLayoutUI.css'

export default class MainLayoutUI extends React.Component {
  render() {
    //   <div id="MainLayoutUI" className="body">
      return (
          <Container id="MainLayoutUI" className="body">
              <Row>
                  <header id="primary-header">
                      <Menu menus={this.props.MainMenus}/>
                  </header>
              </Row>
              <Row>
                  <main id="primary-content" >
                      {this.props.children}
                  </main>
              </Row>
              <Row>
                  <Footer/>
              </Row>
          </Container>
      );
  }
}
/*
</div>


*/

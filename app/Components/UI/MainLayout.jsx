import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Menu from './Menu'
import Footer from './Footer'

export default class MainLayout extends React.Component {

  render() {
      var path = this.props.location.pathname
      path = path.substring(1)
      path = path.length > 0 ? path.replace(/\//,'_') : 'HomePage'
    return (
        <Grid id="mainLayout" className='container'>
            <Row className="show-grid">
                <header id="primary-header"
                     className='content row'>
                    <Menu/>
                </header>
            </Row>
            <Row id={path} className="show-grid">
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
/*
style={{backgroundColor:'red'}}
className={styles.primaryHeader}>
className={styles.primaryArea}
*/

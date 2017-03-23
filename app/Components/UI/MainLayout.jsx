import React from 'react';
import Menu from './Menu'
import styles from './MainLayout.css'
import { Grid, Row, Col } from 'react-bootstrap';

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
        </Grid>
    );
  }
}
/*
style={{backgroundColor:'red'}}
className={styles.primaryHeader}>
className={styles.primaryArea}
*/

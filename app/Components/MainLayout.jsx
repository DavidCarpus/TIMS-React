import React from 'react';
import Menu from './Menu'
import styles from './MainLayout.css'

export default class MainLayout extends React.Component {
  render() {
    return (
      <div id="mainLayout" className={styles.mainLayout}>
        <header id="primary-header"  className={styles.primaryHeader}>
            <Menu/>
        </header>
        <main id="primaryArea"  className={styles.primaryArea}>
          {this.props.children}
        </main>
      </div>
    );
  }
}

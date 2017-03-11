import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Page.css'

export default class Page extends React.Component {
    render(){
        return (
            <div
                className={styles.basePage}
                >
                <h2>Page 2</h2>
            </div>
        );
    }
}

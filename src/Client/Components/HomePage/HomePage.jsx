import React from 'react';
// import OnlinePaymentsBlock  from '../OnlinePaymentsBlock'
import Aside from '../Aside'
import NoticesList from '../NoticesList'
import MiniCalendar from '../MiniCalendar'
import {  Col } from 'react-bootstrap';
import './HomePage.css';

export default class HomePage extends React.Component {
    componentWillMount() {
        this.props.fetchData(this.props);
    }

    render() {
        var group ={'link' : 'Home'}
        // console.log( this.props );

        return (
            <div id='HomePage'>
                <Col md={7} mdPush={3} id="contentArea">
                    <div style={{textAlign:'center'}}>
                        <h1>Welcome to the Town of Milton <br/>New Hampshire</h1>
                        <address >
                        424 White Mountain Highway
                        P.O. Box 310
                        Milton, NH 03851
                        </address>
                        603-652-4501
                    </div>

                    <NoticesList
                        group={group}
                        store={this.props.store}
                        groupName='Home'/>
                </Col>
                <Col md={3} mdPull={7}><Aside  group={group}  store={this.props.store} groupName={'Home'} /></Col>
                <Col md={2}  ><MiniCalendar /></Col>
            </div>
        );
    }
}

import React from 'react';
// import OnlinePaymentsBlock  from '../OnlinePaymentsBlock'
import Aside from '../../Components/Aside'
import NoticesList from '../../Components/NoticesList'
import MiniCalendar from '../../Components/MiniCalendar'
import {  Col } from 'react-bootstrap';
import './HomePage.css';

export default class HomePage extends React.Component {
    componentWillMount() {
        this.props.fetchData(this.props);
    }

    render() {
        // console.log(this.props);
        return (
            <div id='HomePage'>
                <Col md={7} mdPush={3} id="contentArea">
                    <div className="title">
                        <h1>Welcome to the {this.props.municipalLongName}</h1>
                        <address >
                        424 White Mountain Highway
                        P.O. Box 310
                        Milton, NH 03851
                        </address>
                        603-652-4501
                    </div>

                    <NoticesList
                        group={this.props.group}
                        store={this.props.store}
                        groupName='Home'/>
                </Col>
                <Col md={3} mdPull={7}><Aside  group={this.props.group}  store={this.props.store} groupName={'Home'} /></Col>
                <Col md={2}  ><MiniCalendar /></Col>
            </div>
        );
    }
}

import React from 'react';
// import OnlinePaymentsBlock  from '../OnlinePaymentsBlock'
import Aside from '../../Components/Aside'
import NoticesList from '../../Components/NoticesList'
import MiniCalendar from '../../Components/MiniCalendar'
// import {  Col } from 'react-bootstrap';
import { Col, Row } from 'reactstrap';

import './HomePage.css';

export default class HomePage extends React.Component {
    componentWillMount() {
        this.props.fetchData(this.props);
    }

    render() {
        // console.log(this.props);
        // <Col md={7} mdPush={3} id="contentArea">
        return (
            <Row id='HomePage'>
                  <Col  md={{size:7, push:3}}  xs={{size:12}}>
                      <div className="title">
                              <h1>Welcome to the {this.props.municipalLongName}</h1>
                              <address >
                                  424 White Mountain Highway<br/>
                                  P.O. Box 310<br/>
                                  Milton, NH 03851
                              </address>
                              603-652-4501
                          </div>
                          <NoticesList
                          group={this.props.group}
                          store={this.props.store}
                          groupName='Home'/>
                  </Col>
                  <Col md={{size:3, pull:7}} xs={{size:12}}>
                      <Aside  group={this.props.group}  store={this.props.store} groupName={'Home'} />
                  </Col>
                  <Col   md='2'  sm={{size:7}}>
                      <div className="title">
                              <MiniCalendar />
                      </div>
                  </Col>
            </Row>
        );
    }
}
/*
<Col md={{size:3}}><Aside  group={this.props.group}  store={this.props.store} groupName={'Home'} /></Col>
<Col md={{size: 7, offset: 3}} id="contentArea">
<div className="title">
<h1>Welcome to the {this.props.municipalLongName}</h1>
<address >424 White Mountain Highway</address>
</div>
</Col>
<Col md={{size:2, offset:10}}><MiniCalendar /></Col>

<Col md={{size: 'auto', push: 3}} id="contentArea">
    <div className="title">
        <h1>Welcome to the {this.props.municipalLongName}</h1>
    </div>

</Col>
<Col md={{size:3, pull: 1}}><Aside  group={this.props.group}  store={this.props.store} groupName={'Home'} /></Col>
<Col md={{size:2, push:7}}><MiniCalendar /></Col>

<NoticesList
group={this.props.group}
store={this.props.store}
groupName='Home'/>

<Col md={3} mdPull={7}><Aside  group={this.props.group}  store={this.props.store} groupName={'Home'} /></Col>
<Col md={2}  ><MiniCalendar /></Col>

*/

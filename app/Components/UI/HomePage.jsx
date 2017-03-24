import React from 'react';
import OnlinePaymentsBlock  from './OnlinePaymentsBlock'
import Aside from '../Containers/Aside'
import NoticesList from '../Containers/NoticesList'
import { Grid, Row, Col } from 'react-bootstrap';

export default class HomePage extends React.Component {
    render() {
        return (
            <div>
                <Col md={10} mdPush={2} id="contentArea">
                    <div style={{textAlign:'center'}}>
                        <h1>Welcome to the Town of Milton <br/>New Hampshire</h1>
                        <address >
                        424 White Mountain Highway
                        P.O. Box 310
                        Milton, NH 03851
                        </address>
                        603-652-4501
                    </div>

                    <NoticesList groupName='Home'/>
                    <OnlinePaymentsBlock/>
                </Col>
                <Col md={2} mdPull={10}><Aside groupName={'Home'} /></Col>
            </div>
        );
    }
}
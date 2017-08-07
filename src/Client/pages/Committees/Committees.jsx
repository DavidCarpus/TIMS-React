import React from 'react';
import {  Col } from 'react-bootstrap';

import Aside from '../../Components/Aside'
import GroupMembers from '../../Components/GroupMembers'
import AgendasAndMinutes from '../../Components/AgendasAndMinutes'
import NoticesList from '../../Components/NoticesList'
import DocumentList  from '../../Components/DocumentList'

import RawText  from '../../Components/RawText'
import './Committees.css'

export default class Committees extends React.Component {
    componentWillMount() {
        // console.log('DepartmentsUI:componentWillMount: ' ,this.props);
        this.props.fetchOUData(this.props.groupName);
    }

    render() {
        return (
            <div id='Committees'>
                <Col md={9}  mdPush={2} id="contentArea"  >

                    <h1 style={{textAlign:'center'}}>{this.props.groupLabel}</h1>

                    <RawText groupPageText={this.props.groupPageText} block='description' />
                    <RawText groupPageText={this.props.groupPageText} block='text1' />

                    <GroupMembers group={this.props.group}  title={' Members'} />
                    <AgendasAndMinutes  group={this.props.group} store={this.props.store}/>
                    <NoticesList group={this.props.group} store={this.props.store} />
                    <DocumentList  group={this.props.group} store={this.props.store} />

                </Col>
                <Col md={2} mdPull={9}><Aside group={this.props.group} store={this.props.store}/></Col>
            </div>
        );
    }
}
/*
*/

import React from 'react';
import {  Col } from 'react-bootstrap';

import Aside from '../Aside'
import DocumentList  from '../DocumentList'
import GroupMembers from '../GroupMembers'
import AgendasAndMinutes from '../AgendasAndMinutes'
import NoticesList from '../NoticesList'

import RawText  from '../RawText'
import './Committees.css'

export default class Committees extends React.Component {
    render() {
        var groupPageText = this.props.groupPageText
        var groupName = this.props.groupName
        var groupLabel = this.props.group.description ||  this.props.group.desc ||  this.props.groupName

        return (
            <div id='Committees'>
                <Col md={9}  mdPush={2} id="contentArea"  >

                    <h1 style={{textAlign:'center'}}>{groupLabel}</h1>

                    <RawText groupPageText={groupPageText} block='description' />
                    <RawText groupPageText={groupPageText} block='text1' />
                    <NoticesList
                        group={this.props.group}
                        store={this.props.store}
                        groupName={groupName}/>
                    <GroupMembers group={this.props.group} groupName={groupName} title={' Members'} />

                    <AgendasAndMinutes groupName={groupName} group={this.props.group} store={this.props.store}/>

                    <DocumentList groupName={groupName} group={this.props.group} store={this.props.store} />
                </Col>
                <Col md={2} mdPull={9}><Aside group={this.props.group} Name={groupName} store={this.props.store}/></Col>
            </div>
        );
    }
}

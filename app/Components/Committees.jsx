import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import Aside from '../Containers/Aside'
import DocumentList  from '../Containers/DocumentList'
import GroupMembers from '../Containers/GroupMembers'
import AgendasAndMinutes from '../Containers/AgendasAndMinutes'
import NoticesList from '../Containers/NoticesList'

import RawText  from './RawText'

export default class Committees extends React.Component {
    componentWillMount() {
        if (!this.props.loading) {
            this.props.fetchOUData(this.props.groupName);
        }
    }

    render() {
        var groupPageText = this.props.groupPageText
        var groupName = this.props.groupName
        var groupLabel = this.props.group.description ||  this.props.group.desc ||  this.props.groupName

        return (
            <div>
                <Col md={10}  mdPush={2} id="contentArea"  >

                    <h1 style={{textAlign:'center'}}>{groupLabel}</h1>

                    <RawText groupPageText={groupPageText} block='desc' />
                    <RawText groupPageText={groupPageText} block='text1' />
                    <NoticesList
                        group={this.props.group}
                        groupName={groupName}/>
                    <GroupMembers group={this.props.group} groupName={groupName} title={' Members'} />

                    <AgendasAndMinutes groupName={groupName} group={this.props.group} title={' Agendas and Minutes'} />

                    <DocumentList groupName={groupName} group={this.props.group} />
                </Col>
                <Col md={2} mdPull={10}><Aside group={this.props.group} Name={groupName} /></Col>
            </div>
        );
    }
}

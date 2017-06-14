import React from 'react';
import {  Col } from 'react-bootstrap';

import Aside from '../Aside/AsideC'
import DocumentList  from '../DocumentList/DocumentListC'
import GroupMembers from '../GroupMembers/GroupMembersC'
import AgendasAndMinutes from '../AgendasAndMinutes/AgendasAndMinutesC'
import NoticesList from '../NoticesList/NoticesListC'

import RawText  from '../RawText'

export default class Committees extends React.Component {
    render() {
        var groupPageText = this.props.groupPageText
        var groupName = this.props.groupName
        var groupLabel = this.props.group.description ||  this.props.group.desc ||  this.props.groupName
        // this.requestGroupLoad(groupName);

        return (
            <div>
                <Col md={10}  mdPush={2} id="contentArea"  >

                    <h1 style={{textAlign:'center'}}>{groupLabel}</h1>

                    <RawText groupPageText={groupPageText} block='desc' />
                    <RawText groupPageText={groupPageText} block='text1' />
                    <NoticesList
                        group={this.props.group}
                        store={this.props.store}
                        groupName={groupName}/>
                    <GroupMembers group={this.props.group} groupName={groupName} title={' Members'} />

                    <AgendasAndMinutes groupName={groupName} group={this.props.group} title={' Agendas and Minutes'} store={this.props.store}/>

                    <DocumentList groupName={groupName} group={this.props.group} store={this.props.store} />
                </Col>
                <Col md={2} mdPull={10}><Aside group={this.props.group} Name={groupName} store={this.props.store}/></Col>
            </div>
        );
    }
}

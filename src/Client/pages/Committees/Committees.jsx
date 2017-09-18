import React from 'react';
import { Col, Row } from 'reactstrap';
// import {  Col } from 'react-bootstrap';

// import Aside from '../../Components/Aside'
import GroupMembers from '../../Components/GroupMembers'
import AgendasAndMinutes from '../../Components/AgendasAndMinutes'
import NoticesList from '../../Components/NoticesList'
import DocumentList  from '../../Components/DocumentList'
import HelpfulInformation  from '../../Components/HelpfulInformation'

import RawText  from '../../Components/RawText'
import './Committees.css'
import PageNavbar from '../../Components/PageNavbar'

function pageNav() {
    return (
    <PageNavbar menus={[
            {text:'^^^', target:'primary-content-top', hoverText:'Top'},
            {text:'Agendas', target:'AgendasAndMinutes-bookmark', fontAwsomeIcon:'fa-calendar'},
            {text:'Docs', target:'DocumentList-bookmark', fontAwsomeIcon:'fa-file-text'},
            // {text:'Contacts', target:'groupMembers-bookmark'}
        ]}/>
    )
}

export default class Committees extends React.Component {
    componentWillMount() {
        // console.log('DepartmentsUI:componentWillMount: ' ,this.props);
        this.props.fetchOUData(this.props.groupName);
    }

    render() {
        return (
                <Row id='Committees'>
                    {pageNav()}

                    <Col  md={{size:10, push:1}} >
                            <div className="blockSection">
                                <h1 style={{textAlign:'center'}}>{this.props.groupLabel}</h1>

                                <RawText groupPageText={this.props.groupPageText} block='description' />
                                <RawText groupPageText={this.props.groupPageText} block='text1' />
                                <GroupMembers group={this.props.group}  title={' Members'} />
                            </div>

                            <AgendasAndMinutes  group={this.props.group} store={this.props.store}/>
                            <NoticesList group={this.props.group} store={this.props.store} />
                            <DocumentList  group={this.props.group} store={this.props.store} />
                            <HelpfulInformation informationArray={this.props.group.helpfulinformation || []} />

                    </Col>
            </Row>
        );
    }
}
/*
<Col  md={{size:7, push:3}}>
    <div className="title">
            <h1>Welcome to the {this.props.municipalLongName}</h1>
            <address >424 White Mountain Highway</address>
        </div>
        <NoticesList
        group={this.props.group}
        store={this.props.store}
        groupName='Home'/>
</Col>
<Col md={{size:3, pull:7}}>
    <Aside  group={this.props.group}  store={this.props.store} groupName={'Home'} />
</Col>
<Col   md='2'>
    <div className="title">
            <MiniCalendar />
    </div>
</Col>


<Col md={{size:2, pull:9}}>
<Aside group={this.props.group} store={this.props.store}/>
</Col>

<Col  md={{size:10, push:1}} id="contentArea" >
<h1 style={{textAlign:'center'}}>About the {this.props.Config.municipalLongName}</h1>
<RawText groupPageText={groupPageText} block='description' />
</Col>
*/

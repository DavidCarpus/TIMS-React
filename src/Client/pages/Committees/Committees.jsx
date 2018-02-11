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
import {PageNavbar, addMenu} from '../../Components/PageNavbar'

export default class Committees extends React.Component {
    componentWillMount() {
        this.props.fetchOUData(this.props.groupName);
    }

    render() {
        let pageNavMenus=[ {text:'^^^', target:'primary-content-top', hoverText:'Top'}]
        if (this.props.groupMembers.length > 0 ) {
            pageNavMenus = addMenu(pageNavMenus, {text:'Contacts', target:'groupMembers-bookmark', fontAwsomeIcon:'fa-address-book'});
        }
        if (this.props.agendas.length > 0 ) {
            pageNavMenus = addMenu(pageNavMenus, {text:'Agendas', target:'AgendasAndMinutes-bookmark', fontAwsomeIcon:'fa-clock-o'});
        }
        if (this.props.notices.length > 0 ) {
            pageNavMenus = addMenu(pageNavMenus, {text:'Notices', target:'Notices-bookmark', fontAwsomeIcon:'fa-bell'});
        }
        if (this.props.documents.length > 0 ) {
            pageNavMenus = addMenu(pageNavMenus, {text:'Docs', target:'DocumentList-bookmark', fontAwsomeIcon:'fa-file-text'});
        }
        // console.log('this.props.groupPageText', this.props.groupPageText);

        return (
                <Row id='Committees'>
                    <PageNavbar menus={pageNavMenus}/>

                    <Col  md={{size:10, push:1}} >
                            <div className="blockSection">
                                <h1 style={{textAlign:'center'}}>{this.props.groupLabel}</h1>

                                <RawText groupPageText={this.props.groupPageText} block='description' />
                                <RawText groupPageText={this.props.groupPageText} block='desc' />
                                <RawText groupPageText={this.props.groupPageText} block='text1' />
                            </div>

                            {(this.props.agendas.length > 0 ) && <AgendasAndMinutes  group={this.props.group} store={this.props.store}/>}
                            {(this.props.notices.length  > 0) &&<NoticesList group={this.props.group} store={this.props.store} />}
                            {(this.props.groupMembers.length  > 0) &&<GroupMembers  group={this.props.group} title={' Members'}  showTerm={true} />}
                            {(this.props.documents.length  > 0) &&<DocumentList groupName={this.props.groupName} group={this.props.group} store={this.props.store} />}
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

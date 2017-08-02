import React from 'react';
import Aside from '../Components/Aside'

// import SmartLink from '../Components/SmartLink'
import DocumentList  from '../Components/DocumentList'
import NoticesList from '../Components/NoticesList'
import RawText from '../Components/RawText'

import FAQList  from '../Components/FAQList'
import {  Col } from 'react-bootstrap';
import {  Row } from 'react-bootstrap';

export default class Welfare extends React.Component {

    render() {
        var group = this.props.group;

        return (
            <Row id={group.link} className="show-grid">
            <Col md={9}  mdPush={2} id="contentArea"  >
                <h1 style={{textAlign:'center'}}>{group.description}</h1>

                        <RawText groupPageText={this.props.group.pagetext} block='description' />

                        <NoticesList
                            group={this.props.group}
                            store={this.props.store}
                            groupName={group.Name}/>

                        <RawText groupPageText={this.props.group.pagetext } block='text1' />

                        <DocumentList group={group}  groupName={group.link}  store={this.props.store}/>

                        <FAQList group={group} groupName={group.link}  store={this.props.store}/>
                        </Col>
                        <Col md={2} mdPull={9}><Aside group={group}  store={this.props.store} /></Col>
                    </Row>

        );
    }

}

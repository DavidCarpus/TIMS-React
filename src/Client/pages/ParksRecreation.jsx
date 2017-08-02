import React from 'react';
import { Col } from 'react-bootstrap';

import Aside from '../Components/Aside'
import EB2ServiceBlock from '../Components/EB2ServiceBlock'
import NoticesList from '../Components/NoticesList'
import TownNewsletters from '../Components/TownNewsletters'
import RawText from '../Components/RawText'


export default class ParksRecreation extends React.Component {
    render() {
        var group = this.props.group;
        return (
            <div>
                <Col md={9}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Parks and Recreation</h1>
                    <RawText groupPageText={group.pagetext } block='description' />
                    <EB2ServiceBlock groupName={group.link}/>
                    <NoticesList
                        group={this.props.group}
                        store={this.props.store}
                        groupName={group.link}/>

                    <TownNewsletters title={'Milton Town Gazette'} group={this.props.group} store={this.props.store} />
                </Col>
                <Col md={2} mdPull={9}><Aside group={this.props.group} store={this.props.store}/></Col>

            </div>
        );
    }
}

import React from 'react';
import { Col } from 'react-bootstrap';

import Aside from '../Components/Aside/AsideC'
import EB2ServiceBlock from '../Components/EB2ServiceBlock/EB2ServiceBlockC'
import NoticesList from '../Components/NoticesList/NoticesListC'
import TownNewsletters from '../Components/TownNewsletters/TownNewslettersC'
import RawText from '../Components/RawText'


export default class ParksRecreation extends React.Component {
    render() {
        var group = this.props.group;
        var groupPageText = group.pagetext ? group.pagetext[0]: '';
        console.log('ParksRecreation:', this.props);
        return (
            <div>
                <Col md={10}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Parks and Recreation</h1>
                    <RawText groupPageText={groupPageText} block='text1' />
                    <EB2ServiceBlock groupName={group.link}/>
                    <NoticesList
                        group={this.props.group}
                        store={this.props.store}
                        groupName={group.link}/>

                    <TownNewsletters title={'Milton Town Gazette'} group={this.props.group} store={this.props.store} />
                </Col>
                <Col md={2} mdPull={10}><Aside group={this.props.group} store={this.props.store}/></Col>

            </div>
        );
    }
}

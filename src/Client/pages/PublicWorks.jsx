import React from 'react';
import styles from './PublicWorks.css'
import { Col } from 'react-bootstrap';
import Aside from '../Components/Aside/AsideC'
import NoticesList from '../Components/NoticesList/NoticesListC'

import SmartLink from '../Components/SmartLink/SmartLink'
import EB2ServiceBlock from '../Components/EB2ServiceBlock/EB2ServiceBlockC'
import TransferStationRules from '../Components/TransferStationRules/TransferStationRulesC'

export default class PublicWorks extends React.Component {
    render() {
        var group = this.props.group;
        // var groupPageText = group.pagetext;

        return (
            <div>
                <Col md={10}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>{group.description}</h1>
                        <p>The Public Works Department consists of the Highway Department, Transfer Station, and Government Buildings.</p>
                        <NoticesList group={group} groupName={group.link} store={this.props.store}/>

                        <SmartLink link='http://miltonnh-us.com/uploads/highway_30_2123914888.pdf'
                            linkText='ORDINANCE REGULATING HEAVY HAULING OVER TOWN ROADS'/>

                        <hr/>
                        <h2>Transfer Station</h2>
                        <p>
                            603-652-4125
                            Friday- Monday 7am- 3pm
                            (last load accepted at 2:45pm) Closed Holidays
                        </p>
                    <div className={styles.transferMission}>
                        <h3>"If You Don't Know--Don't Throw, Please Ask"</h3>
                        <h3>Misson Statement</h3>
                        <p>At the Milton Transfer Station our goal is to create a polite and friendly atmosphere while committing to a superior level of service to assist the residents in their recycling and disposal needs.</p>
                    </div>

                    <TransferStationRules group={group} />
                    <hr/>
                    <SmartLink link='/TransferRules'
                        linkText='Printable Transfer Station Rules'/>
                    <hr/>

                    <EB2ServiceBlock groupName={group.link}/>
                    Buy Transfer Station Stickers Online
                </Col>
                <Col md={2} mdPull={10}><Aside group={group} store={this.props.store} /></Col>
            </div>
        );
    }
}

/*
*/

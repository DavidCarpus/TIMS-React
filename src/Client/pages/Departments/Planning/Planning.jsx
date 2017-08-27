import React from 'react';
import Aside from '../../../Components/Aside'
import SmartLink from '../../../Components/SmartLink'
import NoticesList from '../../../Components/NoticesList'

import { Col, Row } from 'reactstrap';

export default function Planning({group, store, loading, id, title='Parks and Recreation'}){
    return (
        <Row id='Planning'>
            <Col  md={{size:9, push:2}} id='contentArea'>
                <h1 style={{textAlign:'center'}}>{group.description}</h1>
                The Planning and Land Use Department consists of the following boards:
                <ul>
                    <li><SmartLink link='/BoardsAndCommittees/PlanningBoard' linkText='Planning Board' /></li>
                    <li><SmartLink link='/BoardsAndCommittees/Zoning' linkText='Zoning Board of Adjustment' /></li>
                    <li><SmartLink link='/BoardsAndCommittees/EconomicDevelopment' linkText='Economic Development' /></li>
                    <li><SmartLink link='/BoardsAndCommittees/ConservationCommission' linkText='Conservation Commission' /></li>
                </ul>
                <p>For more information on these Boards and Committees, please click on the desired link above or under "Committees".</p>

                <NoticesList
                    group={group}
                    store={store}
                    groupName={group.Name}/>

                Zoning Ordinance, Site Plan and Subdivision Regulations can be found on the
                <SmartLink link='/BoardsAndCommittees/PlanningBoard' linkText=' Planning Board page' />.
                <br/>
                <p>If you should have any questions please do not hesitate to contact Dana Crossley, Land Use Clerk, at 603-652-4501 x5 or
                    landuse@miltonnh-us.com</p>
                </Col>
            <Col md={{size:2, pull:9}}> <Aside group={group} store={store} /> </Col>
        </Row>
    );
}

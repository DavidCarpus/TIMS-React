import React from 'react';
// import Aside from './Aside'
import Aside from '../Containers/Aside'
import SmartLink from './SmartLink'

import { Grid, Row, Col } from 'react-bootstrap';

export default class Planning extends React.Component {

    render() {
        return (
            <div>
                <Col md={2}><Aside groupName={'Planning'} /></Col>
                <Col md={10}  id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>Planning and Land Use</h1>
                    The Planning and Land Use Department consists of the following boards:
                    <ul>
                        <li><SmartLink link='BoardsAndCommittees/PlanningBoard' linkText='Planning Board' /></li>
                        <li><SmartLink link='BoardsAndCommittees/Zoning' linkText='Zoning Board of Adjustment' /></li>
                        <li><SmartLink link='BoardsAndCommittees/EconomicDevelopment' linkText='Economic Development' /></li>
                        <li><SmartLink link='BoardsAndCommittees/ConservationCommission' linkText='Conservation Commission' /></li>
                    </ul>
                    <p>For more information on these Boards and Committees, please click on the desired link above or under "Committees".</p>

                    Zoning Ordinance, Site Plan and Subdivision Regulations can be found on the
                    <SmartLink link='BoardsAndCommittees/PlanningBoard' linkText=' Planning Board page' />.
                    <br/>
                    <p>If you should have any questions please do not hesitate to contact Dana Crossley, Land Use Clerk, at 603-652-4501 x5 or
                        landuse@miltonnh-us.com</p>
                </Col>
            </div>
        );
    }

}
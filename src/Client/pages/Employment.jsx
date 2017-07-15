import React from 'react';
import {Link} from 'react-router-dom';
// import Aside from '../Components/Aside'
import { Col } from 'react-bootstrap';

export default class Employment extends React.Component {
    render() {
        return (
            <div>
                <Col md={10}  mdPush={1}  id="contentArea"  >
                    <h1>Employment Opportunities</h1>
                    <hr/>
                    <Link to='/Parks'>Summer Recreation Positions</Link>
                </Col>
        </div>
        );
    }
}

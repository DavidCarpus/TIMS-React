import React from 'react';
import Aside from '../Components/Aside/AsideC'
import {  Col } from 'react-bootstrap';

export default class About extends React.Component {

render() {
    var group ={'link' : 'About'}

    return (
        <div>
            <Col md={10}  mdPush={2} id="contentArea"  >
            <h1 style={{textAlign:'center'}}>About the Town of Milton <br/>New Hampshire</h1>
            <p>Milton was incorporated in 1802 and is located in the Northeast section of
                <a href='http://nhdeeds.com/strafford/StHome.html'> Strafford County.</a>
                The principal villages, Milton and Milton Mills, combine to encompass twenty-seven thousand
                acres and has a year-round population of approximately four thousand citizens.  Milton is located
                forty miles from Concord, the state capitol and is twenty miles northwest of the county seat in
                Dover. The principal bodies of water are Milton Three Ponds, a chain of lakes providing a boat
                 launch and public access to the Town Beach.
                </p>

            <p>The North Conway branch of Boston & Maine Railroad runs through our town and Route 16
                 (the Spaulding Turnpike) provides fast access to both ski country and the seacoast.
                </p>

            <p>More information about Milton can be found on <a href='http://en.wikipedia.org/wiki/Milton,_New_Hampshire'>Wikipedia.</a>
                </p>

            </Col>
            <Col md={2} mdPull={10}><Aside group={group}  store={this.props.store} /></Col>
        </div>
    );
}

}

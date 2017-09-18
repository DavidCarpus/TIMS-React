import React, { Component } from 'react';
import { Redirect } from 'react-router'
import { Col, Row } from 'reactstrap';
import SubmitChangeForm  from '../../../Components/SubmitChangeForm'

import  "./SubmitChange.css"

//==================================================
class SubmitChange extends Component {
  render() {
    return (
        <Row >
                <Col  md={{size:10, push:1}}  xs={{size:12}}>
                    <div id="SubmitChange">
                        <SubmitChangeForm {...this.props} onSubmit={this.props.onChangesSubmit}/>
                </div>
                {!this.props.loggedin &&
                    <Redirect to={'/Admin'}/>
                }
            </Col>
    </Row>
    );
  }
}

export default SubmitChange

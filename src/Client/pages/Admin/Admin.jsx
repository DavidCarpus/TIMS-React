import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Redirect } from 'react-router'

import LoginSignUpForm  from '../../Components/LoginSignUpForm'
import  "./Admin.css"
//==================================================
export default class Admin extends Component {
  render() {
    return (
        <Row >
                <Col  md={{size:10, push:1}}  xs={{size:12}}>
                    <div id="Admin">
                        {!this.props.loggedin &&
                            <LoginSignUpForm initialValues={this.props.initialValues} {...this.props} onSubmit={this.props.handleSignInSubmit}></LoginSignUpForm>
                        }
                        {this.props.loggedin &&
                            <Redirect to={'/Admin/SubmitChange'}/>
                        }
                </div>
            </Col>
    </Row>
    );
  }
}

// export default Admin

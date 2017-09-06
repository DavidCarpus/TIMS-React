import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import LoginSignUpForm  from '../../Components/LoginSignUpForm'
import SubmitChangeForm  from '../../Components/SubmitChangeForm'

import  "./Admin.css"

//==================================================
// let SubmitChangeForm = props => {
//     console.log(props);
//     return (
//         <div id='SubmitChangeForm'>
//             SubmitChangeForm
//         </div>
//     )
// }

//==================================================
class Admin extends Component {
  render() {
    return (
        <Row >
                <Col  md={{size:10, push:1}}  xs={{size:12}}>
                    <div id="Admin">
                        {this.props.action}
                        {this.props.loggedin &&
                            <SubmitChangeForm {...this.props} onSubmit={this.props.onChangesSubmit}/>
                        }
                        {!this.props.loggedin &&
                            <LoginSignUpForm initialValues={this.props.initialValues} {...this.props} onSubmit={this.props.handleSignInSubmit}></LoginSignUpForm>
                        }
                </div>
            </Col>
    </Row>
    );
  }
}

export default Admin

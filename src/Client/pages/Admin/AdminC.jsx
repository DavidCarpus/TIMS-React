// import React from 'react';
import Admin from './Admin'
 import { connect } from 'react-redux'
 import { authenticationRequest } from '../../actions/AuthenticationRequests'

 const mapStateToProps = (state, ownProps) => {
     let recordState = state.Authentication;
     let initialValues = {}

     if (process.env.NODE_ENV === 'development') {
         initialValues = {
             email: 'David.Carpus@gmail.com',
             password: '123456789',
         }
     }

     const loggedin = (recordState.data && recordState.data.token && recordState.data.token.length > 10);

     return {
         initialValues: initialValues,
         err: recordState.error,
         validData: ownProps.validData,
         loggedin: loggedin,
     };
 }

 const mapDispatchToProps = (dispatch) => {
  return {
    handleSignInSubmit: (values) => {
        var submitData = {...values}
        console.log('handleSignInSubmit:', submitData);
        dispatch(authenticationRequest(submitData));
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);

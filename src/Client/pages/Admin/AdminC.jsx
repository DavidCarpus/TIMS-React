// import React from 'react';
import Admin from './Admin'
 import { connect } from 'react-redux'
 // import { fetchOrganizationalUnitData } from '../../actions/OrganizationalUnitData'
 import { authenticationRequest } from '../../actions/AuthenticationRequests'
 import { submitChangeRequest } from '../../actions/SubmitChange'

 const mapStateToProps = (state, ownProps) => {
     let recordState = state.Authentication;
     let initialValues = {}

    //  const groups=[]

     if (process.env.NODE_ENV === 'development') {
         initialValues = {
             email: 'David.Carpus@gmail.com',
             password: '1234567890'
         }
     }

     const loggedin = (recordState.data && recordState.data.token && recordState.data.token.length > 10)
     return {
         initialValues: initialValues,
         action: ownProps.match.params.action,
         err: recordState.error,
         validData: ownProps.validData,
         loggedin: loggedin,
         menus: state.MainMenus ? state.MainMenus.menus: [],
         // submitting: recordState.submitting,
         dbSubmit: recordState.submitting,
         dbSubmitComplete: !recordState.submitting && recordState.data && recordState.data.alertUserID > 0,
     };
 }

 const mapDispatchToProps = (dispatch) => {
  return {

      onChangesSubmit: (values) => {
          var submitData = {...values}
          console.log('onChangesSubmit:', submitData);
        //   var body = new FormData();
        //   Object.keys(submitData).forEach(( key ) => {
        //       console.log('body.append:', key);
        //       body.append(key, submitData[ key ]);
        //   });
        //   console.log('onChangesSubmit:body:', body);
          dispatch(submitChangeRequest(submitData));

          //
        //   submitData.options = alertOptions.map(alertOption => {
        //       let option = {NoticeType:alertOption.type, enabled: values['alertOption_'+alertOption.label] || false}
        //       delete submitData['alertOption_'+alertOption.label]
        //       return option;
        //   })
        //   dispatch(pushAlertRequests(submitData));
    },
    handleSignInSubmit: (values) => {
        var submitData = {...values}
        console.log('onSignIn:', submitData);
        dispatch(authenticationRequest(submitData));

    },
    // handleSubmit: (values) => {
    //     var submitData = {...values}
    //     console.log('handleSubmit:', submitData);
    // },

  //    fetchData: (groupName) => {
  //        dispatch(fetchOrganizationalUnitData(groupName))
  //   }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);

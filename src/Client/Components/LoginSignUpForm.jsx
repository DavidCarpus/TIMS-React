import React from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'
var emailValidate = require("email-validator");

let LoginSignUpForm = props => {
  const {
      handleSubmit,
    //   handleSignInSubmit,
      dbSubmit,
      validData,
      err,
  } = props

  // console.log('LoginSignUpForm:err:', err);

  const validToSubmit = (validData['email'] && validData['password'] && !dbSubmit)
    return (
        <div id='Login'>
            <form onSubmit={values => handleSubmit(values)}>
                <div>Please login or register</div>
                    <div>
                        <label htmlFor='email' className={validData['email']? '': 'required'}>Email Address: </label>
                        <Field name="email" component="input" type="text" size='30'/>
                        { err && !err.success && err.errors && err.errors.email}
                        <br/>
                        <label htmlFor='password' className={validData['password']? '': 'required'}>Password: </label>
                        <Field name="password" component="input" type="password"/>
                            { err && !err.success && err.errors && err.errors.password}
                            <div>
                                <button className='button' type="submit" disabled={!validToSubmit || dbSubmit}>Submit</button>
                            </div>
                            {(err && !err.success  ) ? err.message : "Valid"}
                </div>
            </form>
        </div>
    )
}

//==================================================
const selector = formValueSelector('LoginSignUpForm') // <-- same as form name
LoginSignUpForm = connect(
  state => {
      const email = selector(state, 'email')
      const password = selector(state, 'password')
      const validData = {email: (email && email.length > 3 && emailValidate.validate(email)),
          password: (password && password.length > 3)
      }

    return {
      email,
      validData
    }
  }
)(LoginSignUpForm)

export default reduxForm({ form: 'LoginSignUpForm' })(LoginSignUpForm)

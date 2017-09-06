import React from 'react';
// import { Link } from 'react-router';
import { Field, reduxForm } from 'redux-form'


let SignUpForm = ({
  onSubmit,
  onChange,
  errors,
  user,
}) => (
  <div className="container">
    <form action="/" onSubmit={onSubmit}>
      <h2 className="card-heading">Sign Up</h2>

      {errors.summary && <p className="error-message">{errors.summary}</p>}

      <Field
        name="name"
        component="input"
        type="text"
        placeholder="Name"
      />

      <Field
        name="email"
        component="input"
        type="text"
        placeholder="Email"
      />

      <Field
        name="password"
        component="input"
        type="text"
        placeholder="Password"
      />

      <button type="submit" >Login/Sign Up</button>

    </form>
</div>
);

//   <CardText>Already have an account? <Link to={'/login'}>Log in</Link></CardText>

// SignUpForm.propTypes = {
//   onSubmit: PropTypes.func.isRequired,
//   onChange: PropTypes.func.isRequired,
//   errors: PropTypes.object.isRequired,
//   user: PropTypes.object.isRequired
// };

SignUpForm = reduxForm({
  form: 'SignUpForm'  // a unique identifier for this form
})(SignUpForm)

export default SignUpForm;

const jwt = require('jsonwebtoken');
// const User = require('mongoose').model('User');
const PassportLocalStrategy = require('passport-local').Strategy;
// const config = require('../../config');
var Config = require('../../config'),
configuration = new Config();

const validEmails = require('../../private/ValidEmails.json');

const userRecord = (email) =>
    (validEmails.filter(userData => userData.email === email).length === 1) ?
    validEmails.filter(userData => userData.email === email)[0] :
    []

/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, email, password, done) => {

  const userData = {
    email: email.trim(),
    password: password.trim()
  };

  // UserSchema.methods.comparePassword = function comparePassword(password, callback) {
  //   bcrypt.compare(password, this.password, callback);
  // };

if (userRecord(email).password !== userData.password) {
    const error = new Error('Incorrect email or password');
    error.name = 'IncorrectCredentialsError';
    return done(error);
}

    const payload = {
        sub: email
    };
    // create a token string
    const token = jwt.sign(payload, configuration.jwtSecret);
    const data = {
        email: email.trim()
    };
    return done(null, token, data);

});

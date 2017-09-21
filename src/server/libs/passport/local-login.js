const jwt = require('jsonwebtoken');
// const User = require('mongoose').model('User');
const PassportLocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
// const config = require('../../config');
var Config = require('../../config'),
configuration = new Config();
var knexConfig = require('../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

const privateDir = configuration.mode === 'development' ? '../../../private/'+process.env.REACT_APP_MUNICIPALITY: '../../../private/'

const validEmails = require(privateDir+'/ValidEmails.json');

const comparePassword = function comparePassword(password, storedPwd, callback) {
      bcrypt.compare(password, storedPwd, callback);
};

function getSaltedPassword(password) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt((saltError, salt) => {
            if (saltError) { return reject(saltError); }
            bcrypt.hash(password, salt, (hashError, hash) => {
                  if (hashError) { return reject(hashError); }
                  resolve(hash);
            });
        });
    })
}

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

  const invalidCredentials = new Error('Incorrect email or password');
  invalidCredentials.name = 'IncorrectCredentialsError';
  const payload = {
      sub: userData.email
  };

//*
  // find a user by email address
  return knex('Users').select('*').where({emailAddress: userData.email})
  .then(dbUser => {
      if (dbUser.length === 0) { return done(invalidCredentials);  }

    //   console.log(' dbUser[0]:',  dbUser[0]);
      if ( dbUser[0].password) {
          return comparePassword(userData.password,  dbUser[0].password, (passwordErr, isMatch) => {
            if (passwordErr) { return done(passwordErr); }
            if (!isMatch) { return done(invalidCredentials); }
            const token = jwt.sign(payload, configuration.jwtSecret);

            const data = {
                email: email.trim()
            };
            // console.log("token:", token);
            return done(null, token, data);
        })
    } else {
        getSaltedPassword(userData.password)
        .then(saltedPassword => {
            return knex('Users').update({password:saltedPassword}).where({emailAddress: userData.email})
            .then(updateResult => {
                const token = jwt.sign(payload, configuration.jwtSecret);
                const data = {
                    email: email.trim()
                };
                // console.log("token:", token);
                return done(null, token, data);
            })
            .catch(dbErr => {
                console.log("dbErr", dbErr);
                return done(dbErr);
            })
        })
        .catch(saltErr => {
            console.log('saltErr:', saltErr);
            return done(saltErr);
        })
    }
  })
});

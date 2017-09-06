const express = require('express');
const validator = require('validator');
const passport = require('passport');
var busboy = require('connect-busboy');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');


const router = new express.Router();

const validEmails = require('../private/ValidEmails.json');

const invalidEmail = (email) =>
    typeof email !== 'string' ||
    !validator.isEmail(email) ||
    validEmails.filter(rec => rec.email === email).length === 0

const satisfyPasswordRestrictions = (password) =>
    typeof password === 'string' &&
    password.trim().length >= 8

const viableLoginPayload  = (payload) =>
    payload &&
    validator.isEmail(payload.email) &&
    satisfyPasswordRestrictions(payload.password)


/**
 * Validate the sign up form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignupForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  console.log('validateSignupForm:', payload);

    if (invalidEmail(payload.email)) {
        isFormValid = false;
        errors.email = 'Please provide an authorized email address.';
    }

    if (!satisfyPasswordRestrictions(payload.password) ) {
        isFormValid = false;
        errors.password = 'Password must have at least 8 characters.';
    }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

/****************************************************************
 * Validate the login form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateLoginForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  console.log('validateLoginForm:', payload);

  if (!payload || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
    isFormValid = false;
    errors.email = 'Please provide your email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    isFormValid = false;
    errors.password = 'Please provide your password.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}
//=========================================
router.post('/changeRequest', busboy(), (req, res) => {

    const uploadDir = path.join(__dirname, '/../private/uploads/');
    // console.log('*** uploadDir?:', uploadDir);

    let fieldValues={}

    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        // console.log("req.busboy.on('field':", key, '/', JSON.stringify(value));
        fieldValues[key] = value;
    });

    var fstream;
    req.pipe(req.busboy);
    // console.log('*** req.pipe(req.busboy):');
    req.busboy.on('file', function (fieldname, file, filename) {
        fieldValues['file'] = filename;
        const dest = uploadDir  + filename;
        console.log("Uploading: " + filename);
        // console.log('fs.createWriteStream', 'to', dest);
        fstream = fs.createWriteStream(dest);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log(JSON.stringify(fieldValues));
            return res.json({
                success: true,
                message: 'Change Processed!',
                user: fieldValues
            });
            // res.writeHead(200, { 'Connection': 'close' });
            // res.redirect('back');
        });
    });
    // req.busboy.on('finish', function() {
    //     console.log("req.busboy.on('finish");
    //     // res.writeHead(200, { 'Connection': 'close' });
    //     // res.end("That's all folks!");
    // });


})

router.post('/signin', (req, res, next) => {
    const validationResult = validateSignupForm(req.body);
    console.log('server: signin', req.body, validationResult);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
        errors: validationResult.errors
      });
  }
  return passport.authenticate('local-login', (err, token, userData) => {
      if (err) {
          console.log('passport.authenticate err:', err.name);
          if (err.name === 'IncorrectCredentialsError') {
              return res.status(400).json({
                  success: false,
                  message: err.message
              });
          }

          return res.status(400).json({
              success: false,
              message: 'Could not process the form.'
          });
      }


      return res.json({
          success: true,
          message: 'You have successfully logged in!',
          token,
          user: userData
      });
  })(req, res, next);

  // TODO: check if login exists, add if does not and is valid for this municipality
  // return res.status(200).end();
})

// router.post('/signup', (req, res) => {
//   const validationResult = validateSignupForm(req.body);
//   if (!validationResult.success) {
//     return res.status(400).json({
//       success: false,
//       message: validationResult.message,
//       errors: validationResult.errors
//     });
//   }
//
//   return res.status(200).end();
// });
//
// router.post('/login', (req, res) => {
//   const validationResult = validateLoginForm(req.body);
//   if (!validationResult.success) {
//     return res.status(400).json({
//       success: false,
//       message: validationResult.message,
//       errors: validationResult.errors
//     });
//   }
//
//   return res.status(200).end();
// });


module.exports = router;

const express = require('express');
const validator = require('validator');
const passport = require('passport');
var busboy = require('connect-busboy');
var formidable = require('formidable');
var differenceInCalendarDays = require('date-fns/difference_in_calendar_days')
var addDays = require('date-fns/add_days')
var fs = require('fs');
var path = require('path');
var Config = require('../config'),
configuration = new Config();

var knexConfig = require('../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

const privateDir = configuration.mode === 'development' ? '../../private/'+process.env.REACT_APP_MUNICIPALITY: '../../private/'

const router = new express.Router();

const validEmails = require(privateDir+'/ValidEmails.json');

const uploadDir = path.join(__dirname, privateDir+'/uploads/');
const attachmentDir = path.join(__dirname, privateDir+'/Attachments/');
const getY_M_D = (date) =>  date.getUTCFullYear() + "_" + (date.getUTCMonth()<9?'0':'') + (date.getUTCMonth()+1) +  "_" + (date.getUTCDate()<10?'0':'') + (date.getUTCDate());

const invalidEmail = (email) => typeof email !== 'string' || !validator.isEmail(email) ||
validEmails.filter(rec => rec.email === email).length === 0

// email.indexOf(configuration.validEmailDomain) > 0

const satisfyPasswordRestrictions = (password) => typeof password === 'string' &&
    password.trim().length >= 8

const viableLoginPayload  = (payload) => payload && validator.isEmail(payload.email) &&
    satisfyPasswordRestrictions(payload.password)

const strToDate  = (value) => {
    if (value.match(/^\d{4}/)) { //YMD
        // console.log('Date YMD');
        if (value.indexOf('/') > -1) {
            var dateParts = value.indexOf('/') > -1 ? value.split("/"):value.split("-");
            return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based
        } else {
            var dateParts = value.indexOf('/') > -1 ? value.split("/"):value.split("-");
            return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); // month is 0-based
        }
        return dateObject
    }
    else if (value.match(/\d{4}$/)) { //mdy
        // console.log('Date MDY');
        return  new Date(value)
    }
    else {
        return null;
    }
}


/****************************************************************
* Validate the sign up form
*
* @param {object} payload - the HTTP body message
* @returns {object} The result of validation. Object contains a boolean validation result,
*                   errors tips, and a global message for the whole form.
****************************************************************/
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
//==========================================================
function documentArchiveToggle(recordID) {
    return knex('PublicRecords').select('*').where({id: recordID})
    .then(results => {
        let expireDate = null
        if (results.length >= 0 && results[0].expiredate === null || results[0].expiredate.length === 0) {
            expireDate =new Date()
        } else {
            console.log('results.date:', results[0].date);
        }
        return knex('PublicRecords').update({expiredate: expireDate}).where({id: recordID})
        .then(results => {
            if (results && results.length > 0) {
                record.id = results[0];
            }
            return Promise.resolve(expireDate);
        })
    })
    .catch(dberr => {
        console.log("DBError:", dberr);
        return Promise.reject(dberr);
    })
}

//==========================================================
function enterIntoDB(record) {
    return knex('PublicRecords').insert(record)
    .then(results => {
        if (results && results.length > 0) {
            record.id = results[0];
        }
        return Promise.resolve([record]);
    })
    .catch(dberr => {
        console.log("DBError:", dberr);
        return Promise.reject(dberr);
    })
}
//==========================================================
//http://lmws.net/making-directory-along-with-missing-parents-in-node-js
fs.mkdirParent = function(dirPath, mode, callback) {
    //Call the standard fs.mkdir
    fs.mkdir(dirPath, mode, function(error) {
        //When it fail in this way, do the custom steps
        if (error && error.errno === 34) {
            //Create all the parents recursively
            fs.mkdirParent(path.dirname(dirPath), mode, callback);
            //And then the directory
            fs.mkdirParent(dirPath, mode, callback);
        }
        //Manually run the callback since we used our own callback to do all these
        callback && callback(error);
    });
};

//==========================================================
function processFileUpload(filename, file, fieldValues) {

    const filenameFromFields = (fields) => fields['group'] +
    '_' + getY_M_D(fields['documentDate']) +
    '_' + fields['elementType'] + fields['file'].match(/\.[0-9a-z]+$/i, '')[0]

    //         const destPath = path.dirname(dest);
    //         fs.mkdirParent(destPath, (err) => {

    return new Promise(function(resolve, reject) {
        var fstream;
        fieldValues['file'] = filename;
        const dest = attachmentDir  + fieldValues['documentDate'].getUTCFullYear() + "/" + filenameFromFields(fieldValues)

        // console.log('******************');
        console.log("Uploading: " + filename, 'to', dest);

        fstream = fs.createWriteStream(dest);
        file.pipe(fstream);
        fstream.on('close', function () {
            let extension = filename.match(/\.[0-9a-z]+$/i, '')[0]
            let expires = fieldValues['expires'];
            console.log('expires', expires);
            if (expires !== null && typeof expires !== 'undefined') {
                var dateObject = strToDate(expires)
                if (dateObject === null ) {
                    expires = parseInt(expires)
                    if (expires > 0) {
                        expires = addDays(fieldValues['documentDate'], expires)
                    }
                }
                fieldValues['expires'] = expires;
            }

            const dbRecord={
                fileLink: fieldValues['documentDate'].getUTCFullYear() + "/" + filenameFromFields(fieldValues),
                pageLink: fieldValues['group'],
                date: fieldValues['documentDate'],
                expiredate: fieldValues['expires'],
                recordtype: fieldValues['elementType'],
                mainpage: fieldValues['mainpage']?1:0,
                recorddesc: fieldValues['description'] || filename
            }

            if ( dbRecord.expiredate === 0 ) {
                delete dbRecord.expiredate;
            }
            // console.log('fieldValues:', fieldValues);
            return enterIntoDB(dbRecord)
            .then(dbResult => {
                console.log('enteredIntoDB:', dbResult);
                // console.log('******************');
                resolve({retStatus:200, data: {
                    success: true,
                    message: 'Change Processed!',
                    user: fieldValues
                }})
            })
            .catch(err => {
                console.log('Process error', err);
                console.log('******************');
                reject({retStatus:400, data: {
                    success: false,
                    message: err,
                    errors: {changeRequest: err},
                }})
            })
        });
    });
}
//==========================================================
router.post('/changeRequest', busboy(), (req, res) => {

    let fieldValues={}
    let retStatus=0;

    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        // console.log("req.busboy.on('field':", key, '/', JSON.stringify(value));
        value = value.trim()
        switch (key) {
            case 'documentDate':
            var dateObject = strToDate(value)
            if (dateObject === null) {
                if (retStatus > 0) { return;}
                retStatus = 400;
                return res.status(retStatus).json({
                    success: false,
                    message: "Invalid Date Value",
                    errors: {documentDate:"Invalid Date Value"}
                });
            }
            value = dateObject;
            break;
            default:
        }
        fieldValues[key] = value;
    });

    req.busboy.on('finish', function() {
      console.log('Done parsing form!');
      if (!fieldValues['file'] && fieldValues['updateType'] !== 'Archive') {
          errMessage= "Missing attachment.";
          console.log('server - errMessage:', errMessage);

          if (retStatus > 0) { return;}
          retStatus = 400;
          return res.status(retStatus).json({
              success: false,
              message: errMessage,
              errors: {changeRequest: errMessage},
          });
        }
        if (!fieldValues['file'] && fieldValues['updateType'] === 'Archive') {
            documentArchiveToggle(fieldValues['archiveItem'])
            .then(newExpireDate => {
                fieldValues['expiredate'] = newExpireDate
                if (retStatus > 0) { return;}
                retStatus = 200;
                return res.json({
                    success: true,
                    message: 'Item Archived!',
                    user: fieldValues
                });
            })
            .catch(dberr => {
                errMessage= "Error Archiving item" + fieldValues['archiveItem'] +dberr;
                console.log('server - errMessage:', errMessage);

                if (retStatus > 0) { return;}
                retStatus = 400;
                return res.status(retStatus).json({
                    success: false,
                    message: errMessage,
                    errors: {changeRequest: errMessage},
                });
            })
        }
    //   res.writeHead(303, { Connection: 'close', Location: '/' });
    //   res.end();
    });

    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        processFileUpload(filename, file, fieldValues )
        .then(status => {
            // console.log("processFileUpload:status", status);
            if (retStatus > 0) { return;}
            retStatus = status.retStatus;
            return res.status(retStatus).json(status.data);
        })
        .catch(uploadProcessErr => {
            console.log("uploadProcessErr:", uploadProcessErr);
        })
    });
})

//==========================================================
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

            // console.log('Could not process the form.');
            return res.status(400).json({
                success: false,
                message: 'Could not process the form.'
            });
        }


        // console.log('You have successfully logged in!');
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

module.exports = router;

var Config = require('../../config'),
configuration = new Config();

var knexConfig = require('../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var emailValidate = require("email-validator");
var sendAutomationEmail = require('../emailProcessors/common').sendAutomationEmail;

let cellCarriers = require('./cellCarriers.json')
// Verizon
// We are currently investigating a technical issue that is preventing Verizon clients from signing up for text alerts.  If you use Verizon, please click here to give us your number.

//===========================================
const contactTypes = {
    PHONE : 'phone',
    EMAIL : 'email',
    UNK: 'unknown'
}
//===========================================
function getContactType( textValue) {
    try {
        let phoneNumber= phoneUtil.parse(textValue, 'US');
        if (phoneUtil.isPossibleNumber(phoneNumber)) {
            return contactTypes.PHONE
        }
   } catch (e) {
    //    console.log("NumberParseException was thrown: " + e);
   }
   if(emailValidate.validate(textValue))   return contactTypes.EMAIL;
   return contactTypes.UNK;
}
//===========================================
function dbDateFormat(date) {
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
    var hh = date.getHours();
    var MM = date.getMinutes();
    var SS = date.getSeconds();

    return [date.getFullYear()+ '-',
            (mm>9 ? '' : '0')  + mm+ '-',
            (dd>9 ? '' : '0') + dd+ ' ',
            (hh>9 ? '' : '0') + hh + ':',
            (MM>9 ? '' : '0')  +  MM + ':',
            (SS>9 ? '' : '0')  +  SS,

           ].join('');
}
//===========================================
function validateData(submittedData) {
    let errors=[];

    return errors;
}
//===========================================
function verifyCellNumbers() {
    return knex("AlertUsers").where({dateVerified:0}).whereNotNull('carrier')
    .then(recordsToVerify => {
        return Promise.all(recordsToVerify.map(recordToVerify => {
            return sendVerificationText(recordToVerify);
        }))
    })
}
//===========================================
function verifyEmailAddresses() {
    return knex("AlertUsers").where({dateVerified:0}).whereNull('carrier')
    .then(recordsToVerify => {
        return Promise.all(recordsToVerify.map(recordToVerify => {
            return sendVerificationEmail(recordToVerify);
        }))
    })
}
//===========================================
function sendVerificationEmail(recordToVerify) {
    let destEmail = recordToVerify.contact;
    let subject='Requested alert registration.'
    let text='Please respond to verify you requested alerts to this email address.'
    return sendAutomationEmail(destEmail,  {
        subject: subject,
        text: text,
    })
    .then(emailResult => {
        console.log('emailResult:', emailResult);
        return Promise.resolve(destEmail);
    })
}
//===========================================
function sendVerificationText(recordToVerify) {
    let carrierData = cellCarriers.filter(carrier => carrier.Carrier == recordToVerify.carrier )

    let destEmail = recordToVerify.contact + '@' + carrierData[0].email;
    let subject='Requested alert registration.'
    let text='Please respond to verifyCellNumber.'
    return sendAutomationEmail(destEmail,  {
        subject: subject,
        text: text,
    })
    .then(emailResult => {
        console.log('emailResult:', emailResult);
        return Promise.resolve(destEmail);
    })

    return Promise.resolve(destEmail);
}
//===========================================
function submitData(submittedData) {
    let alertUserData = {
        carrier: submittedData.phoneCarrier,
        contact: submittedData.contact,
        dateVerified: 0
    }
    if(emailValidate.validate(alertUserData.contact)){
        delete alertUserData.carrier;
    }

    const optionToObj = (option) => ({noticeType:option.NoticeType, registrationDate:new Date()})
    let alertRegistrationsDataInserts = submittedData.options.filter(option => option.enabled).map(optionToObj)
    // let alertRegistrationsDataDeletes = submittedData.options.filter(option => !option.enabled).map(optionToObj)

    let sql = knex("AlertUsers").insert(alertUserData).toString()
        sql += " ON DUPLICATE KEY UPDATE updated_at='"  + dbDateFormat(new Date()) + "' , dateVerified=0"

    alertUserID = 0;
    return knex.raw(sql)
        .then(function (response) {
            alertUserID= response[0].insertId
            submittedData.alertUserID = alertUserID;
            let rows = alertRegistrationsDataInserts.map(insert => {
                insert.alertUserID = alertUserID;
                return insert;
            })
            return knex('AlertRegistrations').delete().where({alertUserID:alertUserID})
            .then(deletedRecordCount => {
                return knex.batchInsert('AlertRegistrations', rows)
            })
            .then(insertedRecords => {
                return Promise.resolve(JSON.stringify(submittedData))
            })
        })
}



//===========================================
//===========================================
if (require.main === module) {
    let knexConnection = knex
    verifyCellNumbers(knexConnection)
    .then(verifiedCellNumbers => {
        console.log('verifiedCellNumbers:' + require('util').inspect(verifiedCellNumbers, { depth: null }));
        return verifiedCellNumbers;
    })
    .then(cellsVerified => {
        return verifyEmailAddresses(knexConnection);
    })
    .then(emailsVerified => {
        console.log('emailsVerified:', emailsVerified);
    })
    .then(done => {
        process.exit();
    })
}

//===========================================
module.exports.contactTypes = contactTypes;
module.exports.submitData = submitData;

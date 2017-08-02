var Config = require('../../config'),
configuration = new Config();

var knexConfig = require('../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var emailValidate = require("email-validator");

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
function submitData(submittedData) {
    let alertUserData = {carrier: submittedData.phoneCarrier, contact: submittedData.contact, dateUpdated:new Date()}

    const optionToObj = (option) => ({noticeType:option.NoticeType, registrationDate:new Date()})
    let alertRegistrationsDataInserts = submittedData.options.filter(option => option.enabled).map(optionToObj)
    // let alertRegistrationsDataDeletes = submittedData.options.filter(option => !option.enabled).map(optionToObj)

    let sql = knex("AlertUsers").insert(alertUserData).toString()
        sql += " ON DUPLICATE KEY UPDATE dateUpdated='" + dbDateFormat(new Date()) + "'"

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
module.exports.contactTypes = contactTypes;
module.exports.submitData = submitData;

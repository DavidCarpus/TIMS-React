// var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

let cellCarriers = require('../../AlertRequests/cellCarriers.json')

// var knexConfig = require('../../db/knexfile.js')
// var knex = require('knex')(knexConfig[configuration.mode]);
var knex = require('../../db/mysql').knex;

var dbDateFormat = require('../common').dbDateFormat;

var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var emailValidate = require("email-validator");

// var mysql_pool = require('../../db/mysql').mysql_pool;

function processData(data) {
        let action = data.DBData.requestType;
        let entry= translateToDBScheme(data)
        if (entry.err) {
            data.err = entry.err
            return Promise.resolve(data);
        }

        switch (action) {
            case 'VERIFY':
                let contact = entry.contact;
                delete entry.contact;
                return (knex('AlertUsers').update(entry).where({contact:contact})
                .then(results => {
                    entry.id = results;
                    entry.uid = data.uid; // We need to return this so IMAP subsystem can move/delete it.
                    entry.contact = contact;
                    if(! Array.isArray(entry)){
                        entry = [entry];
                    }
                    return Promise.resolve(entry);
                })
                .catch(err => {
                    entry.uid = data.uid; // We need to return this so IMAP subsystem can move/delete it.
                    return Promise.reject(err);
                }))
                break;
            default:
                console.log(' *** Unknown action:' + action + ' for DBData:' , entry);
                return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , data.DBData);
        }

    }
//=============================================
function translateToDBScheme(data) {
    let errors=[];
    let carrier = "";
    let contact = "";

    let from = data.header.from[0]

    contact = from.match( /\d+/g )
    if (contact) {  // Matches 'phoneNumber' pattern
        let email= from.match(/@.*/g)[0].substring(1);
        let carrierData= cellCarriers.filter(carrier => carrier.email.toUpperCase() === email.toUpperCase())[0];
        carrier = (carrierData && carrierData.Carrier) || ""
    } else {
        let email= from.match(/<.*>/g)[0];
        contact = email.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    }

    let entry =  {contact: contact || '',
        dateVerified: dbDateFormat(new Date()),
        carrier: carrier,
        contact:contact,
    }
    // console.log('entry:', entry);
    // errors.push('Debugging translateToDBScheme...')
    if (errors.length > 0) { entry.err = errors; }

    return entry;
}
//=============================================
module.exports.processAlertRequest = processData;

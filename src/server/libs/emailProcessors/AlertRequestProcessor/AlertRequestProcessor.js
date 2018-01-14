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
const validateAlertRequest  = require("../../AlertRequests").validateAlertRequest;

// var mysql_pool = require('../../db/mysql').mysql_pool;

function processData(data) {
        let action = data.DBData.requestType;
        // let entry= translateToDBScheme(data)
        // if (entry.err) {
        //     data.err = entry.err
        //     return Promise.resolve(data);
        // }

        switch (action) {
            case 'VALIDATE':
                return validateAlertRequest(knex, data)
                break;
            default:
                console.log(' *** Unknown action:' + action + ' for DBData:' , data);
                return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , data.DBData);
        }

    }
//=============================================
module.exports.processAlertRequest = processData;

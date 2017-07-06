var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);
// var knex = require('knex')({client:'mysql'});

var simpleAdd = require('../common').simpleAdd;
var simpleRemove = require('../common').simpleRemove;
var dbDateFormat = require('../common').dbDateFormat;

//=============================================
function validateData(requestedData) {
    let errors=[];
    console.log('requestedData:' + require('util').inspect(requestedData, { depth: null }));
    if (typeof requestedData.DBData.URL === 'undefined' || requestedData.DBData.URL.length === 0) {
        errors.push('Missing URL in HelpfulLinks request.')
    }
    if (! requestedData.DBData.groupName || requestedData.DBData.groupName.length <= 0) {
        errors.push('Unable to determine organizational group name.')
    }
    return errors;
}
//=============================================
function getURLFromBody(emailBodyData) {
    let videoLines = emailBodyData.trim().split("\n").filter(line => {return line.match('https?:\/.*youtube.com\/.*') != null});
    // console.log('videoLines:' , videoLines);
    if (videoLines.length > 0) {
        return videoLines[0];
    }
    return "";
}
//=============================================
function translateToDBScheme(emailDBData, emailBodyData) {
    let recordDesc = emailDBData.description;
    if (typeof  recordDesc == 'undefined') {
        recordDesc = 'Video';
    }

    let entry =  {pageLink: emailDBData.groupName,
        date: new Date(emailDBData.date).toISOString(),
        recordtype: emailDBData.recordtype,
        recordDesc: recordDesc,
        fileLink: getURLFromBody(emailBodyData),
        mainpage: emailDBData.mainpage
    }
    if (typeof  emailDBData.expire != 'undefined') {
        entry.expiredate = new Date(emailDBData.expire).toISOString();
    }
    delete entry.attachmentLocations;
    delete entry.requestType;
    return entry;
}
//=============================================
class VideoProcessor {
    process( emailData) {
        let action = emailData.DBData.requestType;
        let errors  = validateData(emailData);
        if (errors.length > 0) {
            emailData.err = errors
            return Promise.resolve([emailData]);
        }

        let entry= translateToDBScheme(emailData.DBData, emailData.bodyData)
        let emailDate = new Date();
        if (entry.date) {
            emailDate = new Date(entry.date);
        }

        let sdate = new Date(emailDate);
        let edate = new Date(emailDate);
        sdate.setDate(sdate.getDate()-3);
        edate.setDate(edate.getDate()+1);

        // Find closest date for meeting
        return knex('PublicRecords').distinct('date')
        .where({pageLink: entry.pageLink})
        .whereBetween('date', [dbDateFormat(sdate), dbDateFormat(edate)])
        .orderBy('date', 'desc')
        .then(results => {
            if (results.length > 0) {
                return results[0].date;
                console.log('Got closest meeting date:', results[0].date);
            } else {
                return emailDate;
            }
        })
        .then( targetDate => {
            // console.log('VideoProcessor - targetDate:' , targetDate);
            entry.date = new Date(targetDate);
            switch (action) {
                case 'ADD':
                    return simpleAdd('PublicRecords', entry, emailData.uid);
                default:
                    return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , emailData.DBData);
            }
        })
    }
}

module.exports.VideoProcessor = VideoProcessor;

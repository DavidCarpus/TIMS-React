var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);
// var knex = require('knex')({client:'mysql'});

function dbDateFormat(date) {
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
    var hh = date.getHours();
    var MM = date.getMinutes();

    return [date.getFullYear()+ '-',
            (mm>9 ? '' : '0')  + mm+ '-',
            (dd>9 ? '' : '0') + dd+ ' ',
            (hh>9 ? '' : '0') + hh + ':',
            (MM>9 ? '' : '0')  +  MM,

           ].join('');
}

function getURLFromBody(emailBodyData) {
    let videoLines = emailBodyData.trim().split("\n").filter(line => {return line.match('https?:\/.*youtube.com\/.*') != null});
    // console.log('videoLines:' , videoLines);
    if (videoLines.length > 0) {
        return videoLines[0];
    }
    return "";
}

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
    // console.log(emailDBData);
    // let entry = Object.assign({}, emailDBData, {attachment: attachment});
    delete entry.attachmentLocations;
    delete entry.requestType;
    return entry;
}

class VideoProcessor {
    process( emailData) {
        // console.log('VideoProcessor - emailData:' , emailData);
        let action = emailData.DBData.requestType;
        let entry= translateToDBScheme(emailData.DBData, emailData.bodyData)
        // console.log('entry:', entry);
        let emailDate = new Date(entry.date);
        let sdate = new Date(emailDate);
        let edate = new Date(emailDate);
        sdate.setDate(sdate.getDate()-3);
        edate.setDate(edate.getDate()+1);

        // Find closest date for meeting
        return knex('PublicRecords').distinct('date')
        .where({pageLink: entry.pageLink})
        .whereBetween('date', [dbDateFormat(sdate), dbDateFormat(edate)])
        // .orWhere({'date': dbDateFormat(emailDate)} )
        .orderBy('date', 'desc')
        .then(results => {
            // console.log('Got closest meeting date:', results);
            return results[0].date;
        })
        .then( targetDate => {
            entry.date = new Date(targetDate);
            switch (action) {
                case 'ADD':
                    return (knex('PublicRecords').insert(entry)
                    .then(results => {
                        entry.id = results[0];
                        entry.uid = emailData.uid; // We need to return this so IMAP subsystem can move/delete it.
                        // console.log('Record inserted.');
                        return Promise.resolve([entry]);
                    })
                    .catch(err => {
                        // console.log('Record insert failed.');
                        entry.uid = emailData.uid; // We need to return this so IMAP subsystem can move/delete it.
                        return Promise.reject(err);
                    }))
                    break;
                default:
                    return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , emailData.DBData);
            }
        })
    }
}

module.exports.VideoProcessor = VideoProcessor;

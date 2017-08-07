// var mysql = require('mysql');
// var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var simpleAdd = require('../common').simpleAdd;
var simpleRemove = require('../common').simpleRemove;
var dbDateFormat = require('../common').dbDateFormat;
var getPublicRecordData = require('../common').getPublicRecordData;

//=============================================
function getClosestMeetingDate(pageLink, emailDate, sdate, edate) {
    return knex('PublicRecords').distinct('date')
    .where({pageLink: pageLink})
    .whereBetween('date', [dbDateFormat(sdate), dbDateFormat(edate)])
    .orderBy('date', 'desc')
    .then(results => {
        if (results.length > 0) {
            Promise.resolve(results[0].date);
        } else {
            Promise.resolve(emailDate);
        }
    })
}
//=============================================
function processTranslatedData(translatedData) {
    if (translatedData.err ) {
        return Promise.resolve( Object.assign({}, translatedData, {err: translatedData.err}));
    }
    return Promise.all(translatedData.map(entry => {
        let {uid, from, requestType, sdate, edate} = entry
        delete entry.uid
        delete entry.from;
        delete entry.requestType;
        delete entry.sdate;
        delete entry.edate;

        return getClosestMeetingDate(entry.pageLink, entry.date, sdate, edate)
        .then( targetDate => {
            entry.date = new Date(targetDate);
            switch (requestType) {
                case 'ADD':
                    return simpleAdd('PublicRecords', entry, uid);
                default:
                    return Promise.reject(' *** Unknown action:' + requestType + ' for DBData:' , emailData);
            }
        })
    }))
}
//===========================================
function translateToDBScheme(dataFromEmail) {
    let errors=[];
    if (typeof dataFromEmail.DBData.URL === 'undefined' || dataFromEmail.DBData.URL.length === 0) {
        errors.push('Missing URL in HelpfulLinks request.')
    }

    let entry=getPublicRecordData(dataFromEmail);

    let emailDate = new Date();
    if (entry.date) {
        emailDate = new Date(entry.date);
    } else {
        entry.date = emailDate;
    }

    entry.sdate = new Date(emailDate);
    entry.edate = new Date(emailDate);
    entry.sdate.setDate(entry.sdate.getDate()-3);
    entry.edate.setDate(entry.edate.getDate()+1);

    if (errors.length > 0) { entry.err = errors; }
    return entry;
}
//=============================================
class VideoProcessor {
    process( emailData) {
        let entry= translateToDBScheme(emailData)
        if (entry.err ) {
            return Promise.resolve( Object.assign({}, emailData, {err: entry.err}));
        }
        return processTranslatedData([entry])
    }
}

module.exports.VideoProcessor = VideoProcessor;

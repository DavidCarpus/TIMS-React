var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);
// var knex = require('knex')({client:'mysql'});

var simpleAdd = require('../common').simpleAdd;
var simpleRemove = require('../common').simpleRemove;

//===========================================
function validateData(requestedData) {
    let errors=[];
    if (! requestedData.attachmentLocations || requestedData.attachmentLocations.length <= 0) {
        errors.push('Missing attachment data.')
    }
    if (! requestedData.DBData.groupName || requestedData.DBData.groupName.length <= 0) {
        errors.push('Unable to determine organizational group name.')
    }

    return errors;
}
//===========================================
function translateToDBScheme(noticeData, attachment) {
    let recordDesc = noticeData.description;
    if (typeof  recordDesc == 'undefined') {
        recordDesc = attachment.substring(attachment.lastIndexOf('/')+1)
        recordDesc = recordDesc.substring(recordDesc.indexOf('_')+1, recordDesc.lastIndexOf('.'))
    }
    let entry =  {pageLink: noticeData.groupName,
        date: new Date(noticeData.date).toISOString(),
        recordtype: noticeData.recordtype,
        recordDesc: recordDesc,
        fileLink: attachment,
        mainpage: noticeData.mainpage
    }
    if (typeof  noticeData.expire != 'undefined') {
        entry.expiredate = new Date(noticeData.expire).toISOString();
    }
    // console.log(noticeData);
    // let entry = Object.assign({}, noticeData, {attachment: attachment});
    delete entry.attachmentLocations;
    delete entry.requestType;
    return entry;
}
//===========================================
class NoticeProcessor {
    process( noticeData) {
        let errors  = validateData(noticeData);
        if (errors.length > 0) {
            noticeData.err = errors
            return Promise.resolve(noticeData);
        }

        let action = noticeData.DBData.requestType;
        return Promise.all(noticeData.attachmentLocations.map(attachment => {
            let entry= translateToDBScheme(noticeData.DBData, attachment)
            switch (action) {
                case 'ADD':
                    return simpleAdd('PublicRecords', entry, noticeData.uid);
                    break;
                default:
                    return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , noticeData.DBData);

            }
        })
        )
    }
}

module.exports.NoticeProcessor = NoticeProcessor;

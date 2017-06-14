var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);
// var knex = require('knex')({client:'mysql'});

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

class DocumentProcessor {
    process( noticeData) {
        let action = noticeData.DBData.requestType;
        // console.log('--------------');
        return Promise.all(noticeData.attachmentLocations.map(attachment => {
            let entry= translateToDBScheme(noticeData.DBData, attachment)
            switch (action) {
                case 'ADD':
                    return (knex('PublicRecords').insert(entry)
                    .then(results => {
                        entry.id = results[0];
                        entry.uid = noticeData.uid; // We need to return this so IMAP subsystem can move/delete it.
                        return Promise.resolve(entry);
                    })
                    .catch(err => {
                        entry.uid = noticeData.uid; // We need to return this so IMAP subsystem can move/delete it.
                        return Promise.reject(err);
                    }))
                    // console.log('knex:' , knex('PublicRecords').insert(entry).toString());
                    break;
                default:
                    return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , noticeData.DBData);

            }
        })
        )
    }
}

module.exports.DocumentProcessor = DocumentProcessor;

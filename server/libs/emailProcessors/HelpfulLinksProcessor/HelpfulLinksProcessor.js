var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var simpleAdd = require('../common').simpleAdd;
var sendAutomationEmail = require('../common').sendAutomationEmail;

//===========================================
function validateData(requestedData) {
    let errors=[];
    if (typeof requestedData.DBData.URL === 'undefined' || requestedData.DBData.URL.length === 0) {
        errors.push('Missing URL in HelpfulLinks request.')
    }
    return errors;
}
//===========================================
function translateToDBScheme(noticeData) {
    let recordDesc = noticeData.description;
    let entry =  {pageLink: noticeData.groupName || '',
        datadesc: recordDesc,
        fileLink: noticeData.URL,
        listName: 'HelpfulLinks'
    }
    delete entry.requestType;
    return entry;
}
//===========================================
class HelpfulLinksProcessor {
    process( noticeData) {
        let errors  = validateData(noticeData);
        if (errors.length > 0) {
            noticeData.err = errors
            return Promise.resolve([noticeData]);
        }

        let action = noticeData.DBData.requestType;
        let entry= translateToDBScheme(noticeData.DBData)
        switch (action) {
            case 'ADD':
                return simpleAdd('ListData', entry, noticeData.uid)
                .then(insertedEntry => {
                    return sendAutomationEmail(noticeData.header.from, {subject:'Added HelpfulLink.', text:entry.datadesc})
                    .then( mailSent =>{
                        return Promise.resolve(insertedEntry);
                    })
                })
                break;
            default:
                return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , noticeData.DBData);
        }
    }
}

module.exports.HelpfulLinksProcessor = HelpfulLinksProcessor;

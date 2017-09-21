var mysql = require('mysql');
var fs = require('fs');
var marked = require('marked');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);
// var knex = require('knex')({client:'mysql'});

var simpleAdd = require('../common').simpleAdd;
var simpleRemove = require('../common').simpleRemove;
var getCleanedTextBody = require('../common').getCleanedTextBody;
var getPublicRecordData = require('../common').getPublicRecordData;

//===========================================
function processData(requestData) {
    let errors  = validateData(requestData);

    if (errors.length > 0) {
        requestData.err = errors
        return Promise.resolve(requestData);
    }
    let action = requestData.DBData.requestType;

    // 'STANDARD File attachment notice'
    if (requestData.attachmentLocations) {
        let prData = getPublicRecordData(requestData);
        return Promise.all(prData.map(entry => {
            switch (action) {
                case 'ADD':
                return simpleAdd('PublicRecords', entry, requestData.uid);
                break;
                default:
                return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , requestData.DBData);
            }
        }))
    } else {
        let entry= getPublicRecordData(requestData)
        let markdownTxt = getCleanedTextBody(requestData.bodyData)
        entry.markdown = markdownTxt

        let pageText = {
            markdown: entry.markdown, // provided markdown
            html: marked(entry.markdown), //markdown converted to HTML
            pageLink: entry.pageLink
        }
        // console.log('pageText:', pageText);

        let publicRecord = {
            pageLink:entry.pageLink,
            recordtype: entry.recordtype,
            recordDesc: entry.recordDesc,
            mainpage: entry.mainpage,
            date: entry.date,
            fileLink: 'MD://' + entry.recordDesc,
            pageTextID: 0
        }
        if (entry.expiredate) {
            publicRecord.expiredate = entry.expiredate
        }
        // console.log('publicRecord:', publicRecord);

        switch (action) {
            case 'ADD':
            return knex.transaction(function (t) {
                return knex("PageText")
                .transacting(t)
                .insert(pageText)
                .then(function (response) {
                    publicRecord.pageTextID = response[0]
                    return knex('PublicRecords')
                    .transacting(t)
                    .insert(publicRecord)
                })
                .then(t.commit)
                .catch(t.rollback)
            }) .then( transactionResult => {
                entry.id = transactionResult[0]
                entry.uid = requestData.uid; // We need to return this so IMAP subsystem can move/delete it.
                return Promise.resolve(entry);
            })
            break;
            default:
            return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , requestData.DBData);
        }
    }
}
//===========================================
function validateData(requestedData) {
    let errors=[];

    if (requestedData.bodyData) {
        let markdownTxt = getCleanedTextBody(requestedData.bodyData)
        // console.log('markdownTxt:', markdownTxt);
        if (!markdownTxt.length > 20 &&
            (! requestedData.attachmentLocations || requestedData.attachmentLocations.length <= 0)) {
                errors.push('Missing attachment data.')
            }
        }

        if (! requestedData.DBData.groupName || requestedData.DBData.groupName.length <= 0) {
            errors.push('Unable to determine organizational group name.')
        }

        return errors;
    }
    //===========================================
    module.exports.processData = processData;

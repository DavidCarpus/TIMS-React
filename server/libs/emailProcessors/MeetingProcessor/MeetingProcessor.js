var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);
// var knex = require('knex')({client:'mysql'});

var simpleAdd = require('../common').simpleAdd;
var simpleRemove = require('../common').simpleRemove;
var getPublicRecordData = require('../common').getPublicRecordData;


//=============================================
function validateData(requestedData) {
    let errors=[];
    console.log('requestedData:' + require('util').inspect(requestedData, { depth: null }));
    if (! requestedData.attachmentLocations || requestedData.attachmentLocations.length <= 0) {
        errors.push('Missing attachment data.')
    }
    if (! requestedData.DBData.groupName || requestedData.DBData.groupName.length <= 0) {
        errors.push('Unable to determine organizational group name.')
    }
    return errors;
}
//=============================================
class MeetingProcessor {
    process( noticeData) {
        let errors  = validateData(noticeData);
        if (errors.length > 0) {
            noticeData.err = errors
            return Promise.resolve([noticeData]);
        }
        let action = noticeData.DBData.requestType;
        let prData = getPublicRecordData(noticeData);
        return Promise.all(prData.map(entry => {
            switch (action) {
                case 'ADD':
                    return simpleAdd('PublicRecords', entry, noticeData.uid);
                    break;
                default:
                    return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , noticeData.DBData);

            }
        }))
    }
}

module.exports.MeetingProcessor = MeetingProcessor;

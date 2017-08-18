var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var simpleAdd = require('../common').simpleAdd;
var replaceAdd = require('../common').replaceAdd;
var getPublicRecordData = require('../common').getPublicRecordData;
var dbDateFormat = require('../common').dbDateFormat;

//=============================================
function processTranslatedData(translatedData,replace) {
    if (translatedData.err ) {
        return Promise.resolve( Object.assign({}, translatedData, {err: translatedData.err}));
    }
    return Promise.all(translatedData.map(entry => {
        let {uid, from, requestType} = entry
        switch (requestType) {
            case 'ADD':
                if (replace) {
                    // Need to strip off time and convert to string to avoid UTC complexities
                    entry.date = entry.date.toISOString().replace(/T.*/,'');
                    let keyFields={date:entry.date, recordtype:entry.recordtype, fileLink:entry.fileLink}
                    return replaceAdd('PublicRecords', entry, uid, keyFields);
                }
                return simpleAdd('PublicRecords', entry, uid);
                break;
            default:
                return Promise.reject(' *** Unknown action:' + requestType + ' for DBData:' , noticeData.DBData);
        }
    }))
}
//=============================================
class MeetingProcessor {
    process( noticeData, replace=false) {
        let prData = getPublicRecordData(noticeData);

        return processTranslatedData(prData,replace)
    }
}

module.exports.MeetingProcessor = MeetingProcessor;

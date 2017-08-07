var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var simpleAdd = require('../common').simpleAdd;
var getPublicRecordData = require('../common').getPublicRecordData;

//=============================================
function processTranslatedData(translatedData) {
    if (translatedData.err ) {
        return Promise.resolve( Object.assign({}, translatedData, {err: translatedData.err}));
    }
    return Promise.all(translatedData.map(entry => {
        let {uid, from, requestType} = entry
        switch (requestType) {
            case 'ADD':
                return simpleAdd('PublicRecords', entry, uid);
                break;
            default:
                return Promise.reject(' *** Unknown action:' + requestType + ' for DBData:' , noticeData.DBData);
        }
    }))
}
//=============================================
class MeetingProcessor {
    process( noticeData) {
        let prData = getPublicRecordData(noticeData);

        return processTranslatedData(prData)
    }
}

module.exports.MeetingProcessor = MeetingProcessor;

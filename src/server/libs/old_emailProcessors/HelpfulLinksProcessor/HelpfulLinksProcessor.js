var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var simpleAdd = require('../common').simpleAdd;
var sendAutomationEmail = require('../common').sendAutomationEmail;

//=============================================
const processData = (emailData)  => {
    let entry= translateToDBScheme(noticeData)
    if (entry.err ) {
        return Promise.resolve( Object.assign({}, noticeData, {err: entry.err}));
    }
    return processTranslatedData([entry])
}
//=============================================
function processTranslatedData(translatedData) {
    if (translatedData.err ) {
        return Promise.resolve( Object.assign({}, translatedData, {err: translatedData.err}));
    }

    return Promise.all(translatedData.map(entry => {
        let {uid, from, requestType} = entry
        console.log('processTranslatedData' +require('util').inspect(entry, { depth: null }));

        switch (requestType) {
            case 'ADD':
                entry
                return simpleAdd('ListData', entry, uid)
                .then(insertedEntry => {
                    return sendAutomationEmail(from, {subject:'Added HelpfulLink.', text:entry.datadesc})
                    .then( mailSent =>{
                        return Promise.resolve(insertedEntry);
                    })
                })
                break;
            default:
                return Promise.reject(' *** Unknown action:' + requestType + ' for DBData:' , translatedData);

        }
    }))
}
//===========================================
function translateToDBScheme(dataFromEmail) {
    let errors=[];
    if (typeof dataFromEmail.DBData.URL === 'undefined' || dataFromEmail.DBData.URL.length === 0) {
        errors.push('Missing URL in HelpfulLinks request.')
    }

    let entry =  {pageLink: dataFromEmail.DBData.groupName || '',
        datadesc: dataFromEmail.DBData.description,
        fileLink: dataFromEmail.DBData.URL,
        listName: 'HelpfulLinks',
        from: dataFromEmail.header.from[0],
        uid: dataFromEmail.uid,
        requestType :  dataFromEmail.DBData.requestType,
    }
    if (errors.length > 0) { entry.err = errors; }
    return entry;
}
//===========================================
module.exports.processData = processData;

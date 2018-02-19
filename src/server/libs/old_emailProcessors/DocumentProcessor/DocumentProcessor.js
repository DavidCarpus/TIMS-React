var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var simpleAdd = require('../common').simpleAdd;
//=============================================
const processData = (emailData)  => processTranslatedData(translateToDBScheme(emailData))

//=============================================
function processTranslatedDataEntry(entry) {
    let {uid, from, requestType} = entry

    switch (requestType) {
        case 'ADD':
            return simpleAdd('PublicRecords', entry, uid);
            break;
        default:
            return Promise.reject(' *** Unknown action:' + requestType + ' for DBData:' , entry);
    }
}
//=============================================
function processTranslatedData(translatedData) {
    if (translatedData.err ) {
        return Promise.resolve( Object.assign({}, translatedData, {err: translatedData.err}));
    }
    if (!Array.isArray(translatedData)) {
        return processTranslatedDataEntry(translatedData)
    }

    return Promise.all(translatedData.map(entry => {
        return processTranslatedDataEntry(entry)
    }))
}
//=============================================
function translateToDBScheme(dataFromEmail) {
    let errors=[];
    if (! dataFromEmail.DBData.groupName || dataFromEmail.DBData.groupName.length <= 0) {
        errors.push('Unable to determine organizational group name.')
    }

    let recordDesc = dataFromEmail.DBData.description;
    let entry =  {pageLink: dataFromEmail.DBData.groupName,
        date: new Date(dataFromEmail.DBData.date).toISOString(),
        recordtype: dataFromEmail.DBData.recordtype,
        recordDesc: recordDesc,
        mainpage: dataFromEmail.DBData.mainpage,
        requestType :  dataFromEmail.DBData.requestType,
    }
    if (typeof  dataFromEmail.DBData.expire != 'undefined') {
        entry.expiredate = new Date(dataFromEmail.DBData.expire).toISOString();
    }

    if (errors.length > 0) { entry.err = errors; }
    // console.log('DocumentProcessor:translateToDBScheme:', entry);

    if (dataFromEmail.attachmentLocations) {
        return dataFromEmail.attachmentLocations.map(attachment => {
            if (typeof  recordDesc == 'undefined') {
                recordDesc = attachment.substring(attachment.lastIndexOf('/')+1)
                recordDesc = recordDesc.substring(recordDesc.indexOf('_')+1, recordDesc.lastIndexOf('.'))
                entry.recordDesc = recordDesc
            }
            console.log('Add attachment ' , attachment);
            return Object.assign({}, entry, {fileLink: attachment})
        })
    } else {
        return Object.assign({}, entry, {err: ['Missing attachment data for document.']});
    }
}
//=============================================
module.exports.processData = processData;

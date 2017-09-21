var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var simpleAdd = require('../common').simpleAdd;
var simpleRemove = require('../common').simpleRemove;

//===========================================
function processData(emailData) {
    let entry= translateToDBScheme(emailData)
    if (entry.err ) {
        return Promise.resolve( Object.assign({}, emailData, {err: entry.err}));
    }
    return processTranslatedData([entry])
}
//===========================================
function getMenuFromBody(emailBodyData) {
    let lines = emailBodyData.trim().split("\n")
    if (lines.length === 1 && lines[0].search(/\//) > 0) {
        return lines[0].trim();
    }
    return "";
}
//===========================================
function processTranslatedData(translatedData) {
console.log('MenuProcessor:processTranslatedData', translatedData);
}
//===========================================
function translateToDBScheme(emailDBData, emailBodyData) {
    console.log('MenuProcessor:translateToDBScheme', emailDBData);
    let errors=[];

    let entry =  {
        pageLink: emailDBData.menu.replace(/.*\//,'/'),
        fullLink: emailDBData.menu,
        description: emailDBData.description || "",
        recordtype: emailDBData.recordtype,
    }

    if (! entry.fullLink ) {
        let bodyMenu = getMenuFromBody( emailData.bodyData)
        entry.fullLink = bodyMenu
    }
    if (typeof entry.fullLink === 'undefined' || entry.fullLink.length === 0) {
        errors.push('Missing menu data.')
    }

    entry.fullLink= '/'+entry.fullLink;

    return entry;
}
//===========================================
module.exports.processData = processData;

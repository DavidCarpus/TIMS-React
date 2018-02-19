var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);
// var knex = require('knex')({client:'mysql'});

var simpleAdd = require('../common').simpleAdd;
var simpleRemove = require('../common').simpleRemove;

//=============================================
const processData = (emailData)  => {
    let errors  = validateData(emailData);
    if (errors.length > 0) {
        emailData.err = errors
        return Promise.resolve(emailData);
    }

    let action = emailData.DBData.requestType;
    let entry= translateToDBScheme(emailData.DBData, emailData.bodyData)
    switch (action) {
        case 'REMOVE':
            return simpleRemove('GroupMembers', entry, emailData.uid);
            break;
        case 'ADD':
            return simpleAdd('GroupMembers', entry, emailData.uid);
            break;
    default:
        return Promise.reject(' *** Unknown UserProcessor action:' + action + ' for DBData:' , emailData.DBData);
    }
}

//=============================================
function validateData(requestedData) {
    let errors=[];
    console.log('requestedData:' + require('util').inspect(requestedData, { depth: null }));
    if (! requestedData.DBData.groupName || requestedData.DBData.groupName.length <= 0) {
        errors.push('Unable to determine organizational group name.')
    }
    let name = requestedData.DBData.name || getUserNameFromBody(requestedData.bodyData)
    if ( name.length <= 0) {
        errors.push('Unable to determine users name.')
    }
    return errors;
}
//=============================================
function getUserNameFromBody(emailBodyData) {
    let lines = emailBodyData.trim().split("\n").filter(line => {return line.match('^name:.*') != null});
    // console.log('lines:' , lines);
    if (lines.length > 0) {
        let name = lines[0].replace('name:','').trim();
        return name.trim();
    }
    return "";
}
//===========================================
function translateToDBScheme(emailDBData, emailBodyData) {
    let entry =  {pageLink: emailDBData.groupName,
        recordtype: emailDBData.recordtype,
        name: getUserNameFromBody(emailBodyData),
    }
    if (typeof  emailDBData.expire != 'undefined') {
        entry.expiredate = new Date(emailDBData.expire).toISOString();
    }
    if (typeof  emailDBData.term != 'undefined') {
        entry.term = emailDBData.term;
    }
    if (typeof  emailDBData.phone != 'undefined') {
        entry.phone = emailDBData.phone;
    }
    if (typeof  emailDBData.email != 'undefined') {
        entry.email = emailDBData.email;
    }
    if (typeof  emailDBData.user != 'undefined') {
        entry.name = emailDBData.user;
    }
    if (typeof  emailDBData.name != 'undefined') {
        entry.name = emailDBData.name;
    }
    //https://www.sitepoint.com/community/t/capitalizing-first-letter-of-each-word-in-string/209644/3
    if (typeof  emailDBData.office != 'undefined') {
        entry.office = emailDBData.office.toLowerCase().replace(/\b[a-z]/g,function(f){return f.toUpperCase();});
    }
    delete entry.attachmentLocations;
    delete entry.requestType;
    delete entry.recordtype;
    return entry;
}
//===========================================
module.exports.processData = processData;

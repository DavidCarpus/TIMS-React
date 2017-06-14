var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);
// var knex = require('knex')({client:'mysql'});

function getUserNameFromBody(emailBodyData) {
    let lines = emailBodyData.trim().split("\n").filter(line => {return line.match('^name:.*') != null});
    // console.log('lines:' , lines);
    if (lines.length > 0) {
        return lines[0].replace('name:','').trim();
    }
    return "";
}

function translateToDBScheme(emailDBData, emailBodyData) {
    let recordDesc = emailDBData.description;
    if (typeof  recordDesc == 'undefined') {
        recordDesc = 'Video';
    }

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
    //https://www.sitepoint.com/community/t/capitalizing-first-letter-of-each-word-in-string/209644/3
    if (typeof  emailDBData.office != 'undefined') {
        entry.office = emailDBData.office.toLowerCase().replace(/\b[a-z]/g,function(f){return f.toUpperCase();});
    }
    // console.log(emailDBData);
    // let entry = Object.assign({}, emailDBData, {attachment: attachment});
    delete entry.attachmentLocations;
    delete entry.requestType;
    return entry;
}

class UserProcessor {
    process( emailData) {
        console.log('UserProcessor - emailData:' , emailData);
        let action = emailData.DBData.requestType;
        let entry= translateToDBScheme(emailData.DBData, emailData.bodyData)
        switch (action) {
            case 'REMOVE':
                delete entry.recordtype;
                return (knex('GroupMembers').where(entry).del()
                .then(results => {
                    entry.id = results;
                    entry.uid = emailData.uid; // We need to return this so IMAP subsystem can move/delete it.
                    return Promise.resolve([entry]);
                })
                .catch(err => {
                    // console.log('Record Delete failed.');
                    entry.uid = emailData.uid; // We need to return this so IMAP subsystem can move/delete it.
                    return Promise.reject(err);
                }))
            break;
            case 'ADD':
                delete entry.recordtype;
                return (knex('GroupMembers').where().insert(entry)
                .then(results => {
                    entry.id = results[0];
                    entry.uid = emailData.uid; // We need to return this so IMAP subsystem can move/delete it.
                    return Promise.resolve([entry]);
                })
                .catch(err => {
                    // console.log('Record Delete failed.');
                    entry.uid = emailData.uid; // We need to return this so IMAP subsystem can move/delete it.
                    return Promise.reject(err);
                }))
            break;
        default:
            return Promise.reject(' *** Unknown UserProcessor action:' + action + ' for DBData:' , emailData.DBData);
        }

    }
}

module.exports.UserProcessor = UserProcessor;

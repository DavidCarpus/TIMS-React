var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

//===========================================
function validateData(requestedData) {
    let errors=[];
    if (typeof requestedData.DBData.menu === 'undefined' || requestedData.DBData.menu.length === 0) {
        errors.push('Missing menu to add in Board/Committee request.')
    }
    if (typeof requestedData.DBData.description === 'undefined' || requestedData.DBData.description.length === 0) {
        errors.push('Missing description of Board/Committee.')
    }

    return errors;
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
function translateToDBScheme(emailDBData, emailBodyData) {
    let entry =  {
        pageLink: emailDBData.menu.replace(/.*\//,'/'),
        fullLink: '/'+emailDBData.menu,
        description: emailDBData.description || "",
        recordtype: emailDBData.recordtype,
    }
    delete entry.attachmentLocations;
    delete entry.requestType;
    delete entry.recordtype;
    return entry;
}
//===========================================
class BoardCommitteeProcessor {
    process( emailData) {
        let errors  = validateData(emailData);
        if (errors.length > 0) {
            emailData.err = errors
            return Promise.resolve([emailData]);
        }
        let action = emailData.DBData.requestType;
        let entry= translateToDBScheme(emailData.DBData, emailData.bodyData)
        switch (action) {
            case 'ADD':
            let listDataEntry = {
                listName: 'OrganizationalUnits',
                pageLink:entry.pageLink.replace(/\//, ''),
                datatext:entry.description,
                datadesc:entry.description
            };
            let menuEntry = entry;

            return knex.transaction(function (t) {
                return knex("ListData")
                .transacting(t)
                .insert(listDataEntry)
                .then(function (response) {
                    return knex('Menus')
                    .transacting(t)
                    .insert(menuEntry)
                })
                .then(t.commit)
                .catch(t.rollback)
            })
            .then(results => {
                // transaction suceeded, data written
                entry.id = results[0];
                entry.uid = emailData.uid; // We need to return this so IMAP subsystem can move/delete it.
                return Promise.resolve([entry]);
            })
            .catch(err => {
                entry.uid = emailData.uid; // We need to return this so IMAP subsystem can move/delete it.
                // transaction failed, data rolled back
                return Promise.reject(err);
            });
            break;
            default:
            console.log(require('util').inspect(entry, { depth: null }));
            return Promise.reject(' *** Unknown BoardCommitteeProcessor action:' + action + ' for DBData:' , emailData.DBData);
        }

    }
}

module.exports.BoardCommitteeProcessor = BoardCommitteeProcessor;

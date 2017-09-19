var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

//===========================================
function processTranslatedData(translatedData) {
    let {requestType, uid} = translatedData
    delete translatedData.requestType
    delete translatedData.uid

    switch (requestType) {
        case 'ADD':
        let listDataEntry = {
            listName: 'OrganizationalUnits',
            pageLink:translatedData.pageLink.replace(/\//, ''),
            datatext:translatedData.description,
            datadesc:translatedData.description
        };
        let menuEntry = translatedData;

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
            translatedData.id = results[0];
            translatedData.uid = uid; // We need to return this so IMAP subsystem can move/delete it.
            return Promise.resolve([translatedData]);
        })
        .catch(err => {
            // transaction failed, data rolled back
            return Promise.reject(err);
        });
        break;
        default:
        console.log(require('util').inspect(translatedData, { depth: null }));
        return Promise.reject(' *** Unknown BoardCommitteeProcessor action:' + requestType + ' for DBData:' , translatedData);
    }
}
//===========================================
function translateToDBScheme(emailData) {
    let errors=[];
    let {menu, description, requestType } = emailData.DBData
    if (typeof menu === 'undefined' || menu.length === 0) {
        errors.push('Missing menu to add in Board/Committee request.')
        menu=''
    }
    if (typeof description === 'undefined' || description.length === 0) {
        errors.push('Missing description of Board/Committee.')
        description=''
    }

    let entry =  {
        pageLink: menu.replace(/.*\//,'/'),
        fullLink: '/'+menu,
        description: description,
        requestType: requestType,
        uid: emailData.uid
    }
    if (errors.length > 0) { entry.err = errors; }
    return entry;
}
//===========================================
class BoardCommitteeProcessor {
    process( emailData) {
        let entry= translateToDBScheme(emailData)
        if (entry.err ) {
            return Promise.resolve( Object.assign({}, emailData, {err: entry.err}));
        }
        return processTranslatedData(entry)
    }
}

module.exports.BoardCommitteeProcessor = BoardCommitteeProcessor;

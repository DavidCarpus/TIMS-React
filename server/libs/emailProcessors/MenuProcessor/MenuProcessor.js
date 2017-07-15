var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var simpleAdd = require('../common').simpleAdd;
var simpleRemove = require('../common').simpleRemove;

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
    delete entry.description;
    return entry;
}
//===========================================
class MenuProcessor {
    process( emailData) {
        let bodyMenu = getMenuFromBody( emailData.bodyData)
        if (! emailData.DBData.menu) {
            if (bodyMenu.length === 0) {
                let entry = [emailData];
                entry[0].err = 'Missing menu data.'
                return Promise.resolve(entry);
            } else {
                emailData.DBData.menu = bodyMenu;
            }
        }
        let action = emailData.DBData.requestType;
        let entry= translateToDBScheme(emailData.DBData, emailData.bodyData)
        switch (action) {
            case 'REMOVE':
                return simpleRemove('Menus', entry, emailData.uid);
                break;
            case 'ADD':
                return simpleAdd('Menus', entry, emailData.uid);
                break;
        default:
            console.log(require('util').inspect(entry, { depth: null }));
            return Promise.reject(' *** Unknown MenuProcessor action:' + action + ' for DBData:' , emailData.DBData);
        }

    }
}

module.exports.MenuProcessor = MenuProcessor;
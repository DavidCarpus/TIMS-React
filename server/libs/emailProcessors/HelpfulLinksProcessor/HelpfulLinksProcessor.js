var mysql = require('mysql');
var fs = require('fs');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);
// var knex = require('knex')({client:'mysql'});

function translateToDBScheme(noticeData) {
    console.log('Translate:',noticeData);
    let recordDesc = noticeData.description;
    let entry =  {pageLink: noticeData.groupName || '',
        // date: new Date(noticeData.date).toISOString(),
        datadesc: recordDesc,
        fileLink: noticeData.URL,
        listName: 'HelpfulLinks'
    }
    delete entry.requestType;
    return entry;
}

class HelpfulLinksProcessor {
    process( noticeData) {
        let action = noticeData.DBData.requestType;
        // console.log('--------------');
        let entry= translateToDBScheme(noticeData.DBData)
        switch (action) {
            case 'ADD':
            console.log('Add HelpfulLinks?:' + require('util').inspect(entry, {colors:true, depth: null }));
                return (knex('ListData').insert(entry)
                .then(results => {
                    console.log('Added HelpfulLinks:' + require('util').inspect(results, {colors:true, depth: null }));
                    entry.id = results[0];
                    entry.uid = noticeData.uid; // We need to return this so IMAP subsystem can move/delete it.
                    return Promise.resolve([entry]);
                })
                .catch(err => {
                    console.log('HelpfulLinks error:' + require('util').inspect(err, {colors:true, depth: null }));
                    entry.uid = noticeData.uid; // We need to return this so IMAP subsystem can move/delete it.
                    entry.err = "DB Error:", err
                    return Promise.reject([err]);
                }))
                // console.log('knex:' , knex('ListData').insert(entry).toString());
                break;
            default:
                return Promise.reject(' *** Unknown action:' + action + ' for DBData:' , noticeData.DBData);

        }
    }
}

module.exports.HelpfulLinksProcessor = HelpfulLinksProcessor;

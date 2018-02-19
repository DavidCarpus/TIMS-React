var mysql = require('mysql');
var fs = require('fs');
var marked = require('marked');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var sendAutomationEmail = require('../common').sendAutomationEmail;
var getCleanedTextBody = require('../common').getCleanedTextBody;

//=============================================
const processData = (emailData)  => {
    let errors  = validateData(requestData);
    if (errors.length > 0) {
        requestData.err = errors
        return Promise.resolve(requestData);
    }

    let action = requestData.DBData.requestType;
    let entry= translateToDBScheme(requestData.DBData)
    let cleanText = getCleanedTextBody(requestData.bodyData);
    console.log('cleanText:', JSON.stringify(cleanText));

    switch (action) {
        case 'REQUEST':
            return (knex('PageText').select().where(entry)
            .then(results => {
                if (results.length > 0) {
                    return sendRequestedPageText(requestData, results[0])
                } else {
                    return Promise.reject('Invalid Request')
                }
            })
            )
        break;
        case 'UPDATE':
            let updateFields = {
                markdown: cleanText, // provided markdown
                html: marked(cleanText) //markdown converted to HTML
            }

            return knex('PageText').update(updateFields).where(entry)
            .then( results => {
                entry.id = 0;
                entry.uid = requestData.uid; // We need to return this so IMAP subsystem can move/delete it.
                console.log('Updated:', entry);
                return Promise.resolve([entry]);
            });

        break;
        case 'ADD':
            entry.markdown = cleanText, // provided markdown
            entry.html =  marked(cleanText) //markdown converted to HTML

            return (knex('PageText').insert(entry)
            .then(results => {
                entry.id = 0;
                entry.uid = requestData.uid; // We need to return this so IMAP subsystem can move/delete it.
                console.log('Added:', entry);
                return Promise.resolve([entry]);
            })
            )
        break;
        default:
        // console.log('entry:', entry);
            return Promise.reject(' *** Unknown PageTextProcessor action:' + action + ' for DBData:' + JSON.stringify(entry, null, 2));

    }
}
//=============================================
function validateData(requestedData) {
    let errors=[];
    if (! requestedData.DBData.section) {
        errors.push('Missing section in page text request for ' + requestedData.DBData.groupName)
    } else {
        let sectionName = translateSection(requestedData.DBData.section)
        if ( sectionName.length <= 0) {
            errors.push('Unknown section ' + (requestedData.DBData.section || '') + ' in request for text for ' + requestedData.DBData.groupName)
        }
    }

    return errors;
}
//=============================================
function translateSection(section) {
    switch (section.toUpperCase()) {
        case 'DESCRIPTION':
        case 'DESC':
            return 'desc'
        case 'TEXT':
        case 'TEXT1':
            return 'text1'
        default:
            throw new Error('Unknown page text section:', requestData.section)
    }
}
//===========================================
function translateToDBScheme(requestData) {
    let entry =  {pageLink: requestData.groupName || '',
        sectionName: translateSection(requestData.section.toUpperCase())
    }
    return entry;
}
//===========================================
function sendRequestedPageText(request, requestedData) {
    // console.log('PageTextProcessor:sendRequestedPageText:'+ requestedData.pageLink + '-' + requestedData.sectionName);
    return sendAutomationEmail(request.header.from,  {
        subject: requestedData.pageLink + '-' + requestedData.sectionName,
        text: requestedData.markdown,
    })
    .then(emailResult => {
        console.log('emailResult:', emailResult);
        request.id = 0;
        return Promise.resolve([request]);
    })
}
//===========================================
module.exports.processData = processData;

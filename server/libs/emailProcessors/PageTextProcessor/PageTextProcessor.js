var mysql = require('mysql');
var fs = require('fs');
var marked = require('marked');
var mailer = require('nodemailer-promise');

var Config = require('../../../config'),
configuration = new Config();

var knexConfig = require('../../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);
// var knex = require('knex')({client:'mysql'});

function translateToDBScheme(requestData) {
    // console.log('Translate:',requestData);
    let section=''
    switch (requestData.section.toUpperCase()) {
        case 'DESCRIPTION':
        case 'DESC':
            section='desc'
            break;
        case 'TEXT':
        case 'TEXT1':
            section='text1'
            break;
        default:

    }
    let entry =  {pageLink: requestData.groupName || '',
        // date: new Date(requestData.date).toISOString(),
        sectionName: section
    }
    delete entry.requestType;
    return entry;
}

function sendRequestedPageText(request, requestedData) {
    // console.log('PageTextProcessor:sendRequestedPageText:', request);
    let emailToSendTo = request.header.from

    var sendEmail = mailer.config({
        email: configuration.imapProcess.imapcredentials.user,
        password: configuration.imapProcess.imapcredentials.password,
        server: configuration.imapProcess.imapcredentials.host,
        port: 465,
    });
    var options = {
        subject: requestedData.pageLink + '-' + requestedData.sectionName,
        senderName: 'Website automation',
        receiver: emailToSendTo,
        text: requestedData.markdown,
    };
    // return Promise.resolve(options)
    return sendEmail(options)
    .then(function(info){
        console.log('Emailed requested data:' + requestedData.pageLink + '-' + requestedData.sectionName)
        request.id = 0;
        return Promise.resolve([request]);
    })   // if successful
    // .then(function(info){console.log(info)})   // if successful
    .catch(function(err){
        console.log('got error'); console.log(err)
    });   // if an error occurs

}
function getCleanedTextBody(originalTextBody) {
    let bodyLines = originalTextBody.trim().split("\n");
    return bodyLines.map( line=>{
        let newLine = line;
        if (line === 'UPDATE' || line === 'PAGETEXT' ) {
            newLine = ''
        }
        if (line.indexOf('Quoting Website automation') >= 0) {
            newLine = ''
        }
        newLine = newLine.replace(/^>/,'').trim()
        return newLine;
    }).join('\n')
}
class PageTextProcessor {
    process( requestData) {
        let action = requestData.DBData.requestType;
        let entry= translateToDBScheme(requestData.DBData)
        switch (action) {
            case 'REQUEST':
                delete entry.requestType;
                delete entry.mainpage;
                delete entry.date;
                // console.log('Fetch from db:', entry);
                return (knex('PageText').select().where(entry)
                .then(results => {
                    if (results.length > 0) {
                        return sendRequestedPageText(requestData, results[0])
                    } else {
                        // console.log(knex('PageText').select().where(entry).toString());
                        return Promise.reject('Invalid Request')
                    }
                })
                // .catch(err => {
                //     console.log('Page Text fetch error', err);
                //      Promise.reject(err);
                // })
                )
            break;
            case 'UPDATE':
                // Remove 'command' lines
                let cleanText = getCleanedTextBody(requestData.DBData.bodyData);
                let updateFields = {
                    // Update the database with provided markdown
                    markdown: cleanText,
                    //  Update the database with markdown converted to HTML
                    html: marked(cleanText)
                }

                return knex('PageText').update(updateFields).where(entry)
                .then( results => {
                    entry.id = 0;
                    entry.uid = requestData.uid; // We need to return this so IMAP subsystem can move/delete it.
                    console.log('Updated:', entry);
                    return Promise.resolve([entry]);
                });

            break;
            default:
                return Promise.reject(' *** Unknown PageTextProcessor action:' + action + ' for DBData:' + JSON.stringify(requestData));

        }
    }
}

module.exports.PageTextProcessor = PageTextProcessor;

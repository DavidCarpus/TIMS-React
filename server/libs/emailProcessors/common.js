var Config = require('../../config'),
configuration = new Config();

var mailer = require('nodemailer-promise');

var knexConfig = require('../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

//===========================================
module.exports =
{
    simpleAdd,
    simpleRemove,
    dbDateFormat,
    sendAutomationEmail
}
//===========================================
//===========================================
function simpleAdd(tablename, entry, emailUID) {
    return (knex(tablename).where().insert(entry)
    .then(results => {
        entry.id = results[0];
        entry.uid = emailUID; // We need to return this so IMAP subsystem can move/delete it.
        if(! Array.isArray(entry)){
            // console.log('simpleAdd: convert to array.', entry);
            entry = [entry];
        }
        return Promise.resolve(entry);
    })
    .catch(err => {
        entry.uid = emailUID; // We need to return this so IMAP subsystem can move/delete it.
        return Promise.reject(err);
    }))
}
//===========================================
function simpleRemove(tablename, entry, emailUID) {
    return (knex(tablename).where(entry).del()
    .then(results => {
        entry.id = results;
        entry.uid = emailUID; // We need to return this so IMAP subsystem can move/delete it.
        if(! Array.isArray(entry)){
            entry = [entry];
            // return Promise.resolve([entry]);
        }
        return Promise.resolve(entry);
    })
    .catch(err => {
        entry.uid = emailUID; // We need to return this so IMAP subsystem can move/delete it.
        return Promise.reject(err);
    }))
}
//===========================================
function dbDateFormat(date) {
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
    var hh = date.getHours();
    var MM = date.getMinutes();

    return [date.getFullYear()+ '-',
            (mm>9 ? '' : '0')  + mm+ '-',
            (dd>9 ? '' : '0') + dd+ ' ',
            (hh>9 ? '' : '0') + hh + ':',
            (MM>9 ? '' : '0')  +  MM,

           ].join('');
}
//===========================================
function sendAutomationEmail(emailAddresses, emailContent) {
    var sendEmail = mailer.config({
        email: configuration.imapProcess.imapcredentials.user,
        password: configuration.imapProcess.imapcredentials.password,
        server: configuration.imapProcess.imapcredentials.host,
        port: 465,
    });
    var options = {
        subject: emailContent.subject,
        senderName: 'Website automation',
        receiver: emailAddresses,
        text: emailContent.text
    };
    // return Promise.resolve(options)
    return sendEmail(options)
    .then(info => {
        console.log('Emailed :' , emailAddresses , emailContent.subject )
        return Promise.resolve([info]);
    })   // if successful
    // .catch(err => {
    //     console.log('got error'); console.log(err)
    //     return Promise.reject(err);
    // });   // if an error occurs
}
//===========================================
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
//===========================================

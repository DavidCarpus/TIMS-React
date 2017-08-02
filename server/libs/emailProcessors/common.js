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
    sendAutomationEmail,
    getPublicRecordData,
    getCleanedTextBody
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
    // tls: {
    //     rejectUnauthorized: false
    // },
    // port: 465,
    // port: 25,
    let credentials = configuration.imapProcess.imapcredentials
    let mailCredentials = {
        email: credentials.senduser || credentials.user,
        password: credentials.sendpassword || credentials.password,
        server: credentials.sendhost || credentials.host,
        port: 465,
    }
    var sendEmail = mailer.config(mailCredentials);
    var options = {
        subject: emailContent.subject,
        senderName: 'Website automation',
        receiver: emailAddresses,
        text: emailContent.text
    };
    // return Promise.resolve(options)
    console.log('Sending email to ', emailAddresses , ' via ' ,  mailCredentials.server);
    return sendEmail(options)
    .then(info => {
        console.log('Emailed :' , emailAddresses , emailContent.subject )
        return Promise.resolve([info]);
    })   // if successful
    .catch(err => {
        console.log('sendAutomationEmail error');
        console.log('mailCredentials:', mailCredentials);
        console.log(err)
        return Promise.reject(err);
    });   // if an error occurs
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
//=============================================
function getURLFromBody(emailBodyData) {
    let videoLines = emailBodyData.trim().split("\n").filter(line => {return line.match('https?:\/.*youtube.com\/.*') != null});
    // console.log('videoLines:' , videoLines);
    if (videoLines.length > 0) {
        return videoLines[0];
    }
    return "";
}

//===========================================
function getCleanedTextBody(originalTextBody) {
    let linesToRemove = [ '^UPDATE$','^PAGETEXT$','^ADD$','^SECTION:',
    'Website automation wrote:','Quoting Website automation',
        '^ADD$',
        'MENU ADD:?','ADD MENU:?','USER ADD:?','ADD USER:?','BOARD ADD:?','ADD BOARD:?',
        '^REMOVE$','^DELETE$',
        'MENU REMOVE:?','REMOVE MENU:?','USER REMOVE:?','REMOVE USER:?','BOARD REMOVE:?','REMOVE BOARD:?',
        'MENU DELETE:?','DELETE MENU:?','USER DELETE:?','DELETE USER:?','BOARD DELETE:?','DELETE BOARD:?',
        '^NOTICE$','^RFP$','^DATE:','^DESCRIPTION:','^DESC:','^EXPIRE', '^PUBLIC RECORD: ?RFP'
        ]
    let bodyLines = originalTextBody.trim().split("\n");
    return bodyLines.map( line=>{
        let newLine = linesToRemove
        .reduce( (acc,value) => {
            // console.log('Chk:', value);
            if (acc.search(new RegExp(value, 'i')) >= 0) {
                acc = "";
            }
            return acc.trim();
        }, line.trim())

        newLine = newLine.replace(/^>*/,'').trim()
        return newLine;
    }).join('\n').trim()
}

//=============================================
function getPublicRecordData(dataFromEmail) {
    // console.log('MeetingProcessor:getPublicRecordData.');
    // console.log('common:getPublicRecordData:dataFromEmail ', dataFromEmail);

    let entry =  {pageLink: dataFromEmail.DBData.groupName,
        date: new Date(dataFromEmail.DBData.date).toISOString(),
        recordtype: dataFromEmail.DBData.recordtype,
        recordDesc: dataFromEmail.DBData.description,
        mainpage: dataFromEmail.DBData.mainpage
    }

    if (typeof  dataFromEmail.DBData.expire != 'undefined') {
        entry.expiredate = new Date(dataFromEmail.DBData.expire).toISOString();
    }
    if (typeof  entry.recordDesc == 'undefined'  && dataFromEmail.DBData.recordtype === 'Video') {
        entry.recordDesc = 'Video'
    }
    if ( dataFromEmail.DBData.recordtype === 'Video') {
        entry.fileLink = getURLFromBody(dataFromEmail.bodyData)
    }
    // console.log('common:getPublicRecordData:attachments? ', dataFromEmail.attachmentLocations);

    if (!dataFromEmail.attachmentLocations || dataFromEmail.attachmentLocations.length === 0) {
        if (typeof  entry.recordDesc == 'undefined') { // 'Markdown style notice'
            entry.recordDesc = 'Notice'
        }
        return entry;
    }
    // console.log('common:getPublicRecordData:attachments!!! ', dataFromEmail.attachmentLocations);

    return dataFromEmail.attachmentLocations.map(attachment => {
        // console.log('common:getPublicRecordData', attachment);

        let recordData = JSON.parse(JSON.stringify(entry))
        recordData.fileLink = attachment
        if (typeof  entry.recordDesc == 'undefined' ){
            if (dataFromEmail.DBData.recordtype === 'Agendas' || dataFromEmail.DBData.recordtype === 'Minutes') {
                recordDesc = attachment.substring(attachment.lastIndexOf('/')+1)
                recordDesc = recordDesc.substring(recordDesc.indexOf('_')+1, recordDesc.lastIndexOf('.'))
            }
        }
        return recordData;
    })
}//===========================================

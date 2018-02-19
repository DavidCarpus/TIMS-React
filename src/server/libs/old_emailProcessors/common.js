var Config = require('../../config'),
configuration = new Config();

var mailer = require('nodemailer-promise');

var knexConfig = require('../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

let credentials = configuration.imapProcess.imapcredentials
var transporter = nodemailer.createTransport(smtpTransport ({
  host: credentials.sendhost || credentials.host,
  // secureConnection: true,
  port: 465,
  auth: {
        user: credentials.senduser || credentials.user,
        pass: credentials.sendpassword || credentials.password,
  }
}));

//===========================================
module.exports =
{
    simpleAdd,
    replaceAdd,
    simpleRemove,
    dbDateFormat,
    sendAutomationEmail,
    getPublicRecordData,
    getCleanedTextBody
}
//===========================================
//===========================================
function replaceAdd(tablename, entry, emailUID, keyFields) {
    // console.log(knex(tablename).select().where(keyFields).toString());
    return knex(tablename).select().where(keyFields)
    .then(results => {
        if (results.length > 0) { //Entry already exists... update it
            delete entry.from;
            delete entry.requestType;
            delete entry.uid
            return knex(tablename).where(keyFields).update(entry)
            .then(results => {
                entry.id = results[0];
                entry.uid = emailUID; // We need to return this so IMAP subsystem can move/delete it.
                if(! Array.isArray(entry)){
                    entry = [entry];
                }
                return Promise.resolve(entry);
            })
            .catch(err => {
                entry.uid = emailUID; // We need to return this so IMAP subsystem can move/delete it.
                return Promise.reject(err);
            })
        } else {
            console.log('knex(tablename).where().insert(entry):', knex(tablename).where().insert(entry).toString() );
            return simpleAdd(tablename, entry, emailUID)
        }
    })
    .catch(err => {
        entry.uid = emailUID; // We need to return this so IMAP subsystem can move/delete it.
        return Promise.reject(err);
    })
}

function simpleAdd(tablename, entry, emailUID) {
    delete entry.from;
    delete entry.requestType;
    delete entry.uid

    // console.log('simpleAdd:entry:', entry, emailUID );
    return knex(tablename).where().insert(entry)
    .then(results => {
        entry.id = results[0];
        entry.uid = emailUID; // We need to return this so IMAP subsystem can move/delete it.
        return Promise.resolve(entry);
    })
    .catch(err => {
        entry.uid = emailUID; // We need to return this so IMAP subsystem can move/delete it.
        return Promise.reject(err);
    })
}
//===========================================
function simpleRemove(tablename, entry, emailUID) {
    return knex(tablename).where(entry).del()
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
    })
}
//===========================================
function dbDateFormat(date, dateOnly=false) {
    var mm = date.getUTCMonth() + 1; // getMonth() is zero-based
    var dd = date.getUTCDate();
    var hh = date.getUTCHours();
    var MM = date.getUTCMinutes();

    if (dateOnly) {
        return [date.getUTCFullYear()+ '-',
                (mm>9 ? '' : '0')  + mm+ '-',
                (dd>9 ? '' : '0') + dd+ ' ',
            ].join('').trim();
    }
    return [date.getUTCFullYear()+ '-',
            (mm>9 ? '' : '0')  + mm+ '-',
            (dd>9 ? '' : '0') + dd+ ' ',
            (hh>9 ? '' : '0') + hh + ':',
            (MM>9 ? '' : '0')  +  MM,
           ].join('').trim();
}
//===========================================
function _sendEmail(
    emailAddresses, emailContent,
    from='Website automation' + '<' + (credentials.senduser || credentials.user) + '>'
) {
    var mailOptions = {
    from:from,
    to: emailAddresses,
    subject: emailContent.subject,
        text: emailContent.text,
    };

    return new Promise(function(resolve, reject) {
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                reject(error);
            }else{
                // console.log('info',info);
                resolve({messageSent: emailAddresses, messageId:info.messageId});
            }
        });
    })
    .then(info => {
        return Promise.resolve({emailContent:emailContent, messageId:info.messageId});
    })   // if successful
    .catch(err => {
        console.log('sendAutomationEmail error');
        console.log('mailCredentials:', mailOptions);
        console.log(err)
        return Promise.reject(err);
    });   // if an error occurs
}
//===========================================
function sendAutomationEmail(emailAddresses, emailContent) {
    return _sendEmail(emailAddresses, emailContent)
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
    videoLines = emailBodyData.trim().split("\n").filter(line => {return line.match('https?:\/.*townhallstreams.com\/.*') != null});
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
    let errors=[];
    // console.log('requestedData:' + require('util').inspect(requestedData, { depth: null }));
    // if (! requestedData.attachmentLocations || requestedData.attachmentLocations.length <= 0) {
    //     errors.push('Missing attachment data.')
    // }
    if (! dataFromEmail.DBData.groupName || dataFromEmail.DBData.groupName.length <= 0) {
        errors.push('Unable to determine organizational group name.')
    }

    let entry =  {pageLink: dataFromEmail.DBData.groupName,
        date: new Date(dataFromEmail.DBData.date),
        recordtype: dataFromEmail.DBData.recordtype,
        recordDesc: dataFromEmail.DBData.description,
        mainpage: dataFromEmail.DBData.mainpage,
        uid: dataFromEmail.uid,
        from: dataFromEmail.header.from,
        requestType :  dataFromEmail.DBData.requestType,
    }

    if (typeof  dataFromEmail.DBData.expire != 'undefined') {
        entry.expiredate = new Date(dataFromEmail.DBData.expire);
    }
    if (typeof  entry.recordDesc == 'undefined'  && dataFromEmail.DBData.recordtype === 'Video') {
        entry.recordDesc = 'Video'
    }
    if ( dataFromEmail.DBData.recordtype === 'Video') {
        entry.fileLink = getURLFromBody(dataFromEmail.bodyData)
    }
    // console.log('common:getPublicRecordData:attachments? ', dataFromEmail.attachmentLocations);

    if (!dataFromEmail.attachmentLocations || dataFromEmail.attachmentLocations.length === 0) {
        if ( ['Notice', 'Video'].indexOf(entry.recordtype) === -1 ) {
            errors.push(`Missing attachment data for  ${entry.recordtype}.` )
        }
        if (errors.length > 0) { entry.err = errors; }
        return entry;

        // console.log('Missing attachment data.', entry);
        if (typeof  entry.recordDesc == 'undefined') { // 'Markdown style notice'
            entry.recordDesc = 'Notice'
        }
        if (errors.length > 0) { entry.err = errors; }
        return entry;
    }
    // console.log('common:getPublicRecordData:attachments!!! ', dataFromEmail.attachmentLocations);

    return dataFromEmail.attachmentLocations.map(attachment => {
        // console.log('common:getPublicRecordData', attachment);

        let recordData = {}
        Object.assign(recordData, entry)
        recordData.fileLink = attachment
        if (typeof  entry.recordDesc == 'undefined' ){
            if (dataFromEmail.DBData.recordtype === 'Agendas' || dataFromEmail.DBData.recordtype === 'Minutes') {
                recordDesc = attachment.substring(attachment.lastIndexOf('/')+1)
                recordDesc = recordDesc.substring(recordDesc.indexOf('_')+1, recordDesc.lastIndexOf('.'))
            }
        }
        if (errors.length > 0) { recordData.err = errors; }
        return recordData;
    })
}//===========================================

var stream = require('stream');
var base64  = require('base64-stream');
var fs      = require('fs');
var mysql = require('mysql');

var imaps = require('imap-simple');

var Config = require('./config'),
configuration = new Config();

var downloadPath='';  //configuration.paths.notices

class IMapProcessor {
    constructor(imapConf, dwnPath){
        this.config = imapConf;
        this.downloadPath = dwnPath;
    }
    process() {
        return processSimpleEmail(imaps, {imap: this.config}, this.downloadPath)
    }
    archiveMessages(uids){
        console.log('archiveMessages:' + require('util').inspect(uids, { depth: null }));
        return Promise.resolve('Done archiveMessages.');
    }
}

module.exports.IMapProcessor = IMapProcessor;

function processSimpleEmail(imapLib, credentials, paths) {
    return imapLib.connect(credentials)
    .then( sconnection => {
        return sconnection.openBox('INBOX').then( box => {
            var searchCriteria = ['ALL'];
            var fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };
            return sconnection.search(searchCriteria, fetchOptions);
        })

        .then(messages => { //Pull header data and store promises to retrieve message body and attachments
            return Promise.all(messages.map(message => {
                attachmentPromises = [];
                bodyPromises = [];
                var parts = imaps.getParts(message.attributes.struct);
                attachmentPromises = attachmentPromises.concat(parts.filter(function (part) {
                    return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
                }).map(function (part) {
                    return sconnection.getPartData(message, part)
                    .then(function (partData) {
                        return {
                            filename: part.disposition.params.filename,
                            data: partData,
                            uid: message.attributes.uid,
                            msg: message.attributes
                        };
                    });
                }));
                bodyPromises = bodyPromises.concat(parts.filter( part => {
                    return part.type == 'text' && part.subtype == 'plain';
                }).
                map(function (part) {
                    return sconnection.getPartData(message, part)
                    .then(function (partData) {
                        return {
                            data: partData,
                            uid: message.attributes.uid,
                            msg: message.attributes
                        };
                    });
                })
            )
            let out = {header:message, bodyPromises: bodyPromises, attachmentPromises: attachmentPromises,uid: message.attributes.uid, }
            return Promise.resolve(out);
            })); // End Promise.all messages
        })

        .then(withAttachPromises => { // Fetch email text body form server
            return Promise.all(withAttachPromises.map(attach => {
                delete attach.header.attributes.struct // We do not need this as we now have promises to request needed data
                return Promise.all(attach.bodyPromises)
                .then(bodyData => {
                    // TODO: ?? Check to make sure bodyData array is len 1??
                    attach.bodyData = bodyData[0].data;
                    delete attach.bodyPromises;
                    return Promise.resolve(attach);
                })
            }))
        })

        .then(withBodies => { // Extract out data from message body for database
            return Promise.resolve(withBodies.map(msgWithBody => {
                let header = msgWithBody.header.parts[0].body;
                msgWithBody.DBData = extractDBData(header, msgWithBody.bodyData);
                msgWithBody.header = {from:header.from,subject:header.subject,to:header.to, date:msgWithBody.header.attributes.date}
                return msgWithBody;
            }))
        })

        .then(withExtractedBodies=>{ // Validate database field data and write out attachments
            return Promise.all(withExtractedBodies.map(msgWithBody => {
                // TODO: Verify required DB field values are present and resolve attachmentPromises
                if (! hasAllRequiredData(msgWithBody.DBData) ){
                    msgWithBody.err = 'Missing required information.(date, type, group, etc..)';
                    return Promise.resolve(msgWithBody);
                }
                if (! msgWithBody.attachmentPromises || msgWithBody.attachmentPromises.length == 0 ){
                    msgWithBody.err = 'Missing required attachments.';
                    delete msgWithBody.attachmentPromises;
                    return Promise.resolve(msgWithBody);
                }

                msgWithBody.attachmentCnt = msgWithBody.attachmentPromises.length;
                return retrieveAttachmentData(msgWithBody, paths);
            }))
        })
        .catch(Err => {
            console.log('messages Err:', Err);
        })
    }) // Connection was successful
    .then(res =>{
        return Promise.resolve(res);
    })
    .catch(connErr => {
        return Promise.reject('connErr:'+ connErr);
    })
}
//=======================================
function retrieveAttachmentData(msgWithBody, paths) {
    return Promise.all(msgWithBody.attachmentPromises)
    .then(retrievedAttachmentData => {
        delete msgWithBody.bodyData;  //No need to keep as we have required field data
        msgWithBody.attachmentLocations = [];
        return Promise.all(retrievedAttachmentData.map(attach => {
            return writeAttachment(attach, paths)
            .then(writtenAttachment => {
                msgWithBody.attachmentLocations = msgWithBody.attachmentLocations.concat(writtenAttachment.filename);
                return Promise.resolve(msgWithBody);
            })
        }))
    })
    .then(retrieved => {
        let promisesRemoved = retrieved.map( singleRetrieval => {
            delete singleRetrieval.attachmentPromises;
            return singleRetrieval;
        })
        return Promise.resolve(msgWithBody);
    });
}
//=======================================
function extractDBData( header, bodyData) {
    const groupNames = ["PublicWorks", "Selectmen", "Recreation"];

    let bodyLines = bodyData.trim().split("\n");
    let results = { mainpage: true, date: new Date(), groupName: 'Main', requestType: 'ADD'};

    bodyLines.map( line=>{
        line = line.toUpperCase().trim();
        var groupName = groupNames.indexOf(line.split(' ').join('')); // Remove spaces from the line
        if (groupName >= 0) { results.groupName = groupNames[groupName]; }

        dte = Date.parse(line);
        if (dte >= 0 ) {
            if(line.indexOf('EXPIRE') >= 0 ) {
                results.expire = dte;
            } else {
                results.date = dte;
            }
        }
        if(line.indexOf('MAINPAGE') >= 0 ) {
            if (line == 'MAINPAGE') {
                results.mainpage = true;
            } else if(line.indexOf('NO') >= 0 ) {
                results.mainpage = false;
            }
        }
        if (line.startsWith('DESC:') || line.startsWith('DESCRIPTION')) {
            results.desc = line;
        }

        if(line.indexOf('AGENDA') >= 0 ) {            results.recordtype = 'Agendas';        }
        if(line == 'NOTICE' ) {            results.recordtype = 'Notice';        }
        if(line == 'UPDATE' ) {            results.requestType = 'UPDATE';        }
    }) // bodyTextPart.map

    // TODO: Determine if header subject contains missing field data
    // console.log('header:' , header);
    let line = header.subject[0].toUpperCase().trim().split(' ').join('');
    var groupName = groupNames.map(name=>{return name.toUpperCase()}).indexOf(line.split(' ').join('')); // Remove spaces from the line
    if (groupName >= 0) { results.groupName = groupNames[groupName]; }

    return results;
}
// =================================================
function hasAllRequiredData(dbData) {
    let requiredFields = ['groupName', 'date', 'requestType', 'recordtype'];
    return requiredFields.reduce((acc, field) => {
        if(dbData[field] == null)  {
            dbData.error = ( typeof dbData.error != 'undefined'  ) ? dbData.error : ''; // Init string as blank if needed
            dbData.error += field
            return false;
        };
        return acc;
    }, true)
}
// =================================================
function writeAttachment(attachment, path) {
    if (typeof attachment.filename != 'undefined') {
        let filename = ""+path + attachment.uid + '_' + attachment.filename
        return new Promise(function(resolve, reject) {
            let writeStream = fs.createWriteStream(filename);
            writeStream.on('error', function (err) {
                reject(err);
            });
            writeStream.on('open', function (fd) {
                writeStream.write(attachment.data);
                writeStream.end();
                attachment.filename = filename;
                delete attachment.data;
                resolve(attachment);
            })

        })
    } else {
        let err = "No attachment for msg: " + attachment.uid;
        return Promise.resolve(Object.assign(attachment,  {error: err}))
    }
}
// =================================================
// processSimpleEmail(imaps, {imap: configuration.imapcredentials}, configuration.paths )
// .then(emails => {
//     emails.map(email => {
//         console.log('Processed simple email:', email);
//     })
//     // console.log('*** Done.', done);
//     process.exit();
// })
// .catch(err => {
//     console.log('err:', err);
// })

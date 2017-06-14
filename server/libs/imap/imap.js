var fs      = require('fs');
var imaps = require('imap-simple');
var extractHeaderData = require('./helperMethods').extractHeaderData;
var extractDBData = require('./helperMethods').extractDBData;

var imapValidator = require('../imapValidator');

var Config = require('../../config'),
configuration = new Config();

//===============================================
class IMapProcessor {
    constructor(imapConf){
        this.config = imapConf.imapcredentials;
        this.downloadPaths = imapConf.downloadPath;
    }
    process() {
        return processSimpleEmail(imaps, {imap: this.config}, this.downloadPaths)
    }
    archiveMessage(uid, destFolder='Processed'){ //destFolder element of {Processed','Errors'}
        return imaps.connect({imap: this.config})
        .then( sconnection => {
            return sconnection.openBox('INBOX').then( box => {
                return sconnection.moveMessage(uid, 'INBOX.'+destFolder)
                .then(movedMsg => {
                   return Promise.resolve(uid);
               })
               .catch(mvErr => {
                   return Promise.reject('mvErr:' + uid +':'+ mvErr);
               })
           })
           .then(movedMsg => {
              return Promise.resolve(uid);
          })
       })
   }
}

module.exports.IMapProcessor = IMapProcessor;
//===============================================
//===============================================
function processSimpleEmail(imapLib, credentials, paths) {
    // console.log('paths:',paths);
    return imapLib.connect(credentials)
    .then( sconnection => {

        return sconnection.openBox('INBOX').then( box => {
            var searchCriteria = ['ALL'];
            var fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true, envelope:true };
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

        .then(withAttachPromises => { // quick validate email envelope
            return imapValidator.validateHostOrigins(withAttachPromises);
        })

        .then(validSender => { // Fetch email text body form server
            return Promise.all(validSender.map(attach => {
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
                msgWithBody.DBData = extractDBData(msgWithBody);
                msgWithBody.header = extractHeaderData(msgWithBody);
                return msgWithBody;
            }))
        })

        .then(withExtractedBodies=>{ // Validate database field data and write out attachments
            return Promise.all(withExtractedBodies.map(msgWithBody => {
                if (! imapValidator.hasAllRequiredData(msgWithBody) ){
                    msgWithBody.err = (msgWithBody.err  || '') + 'Missing required information.(date, type, group, etc..).\n';
                }
                // if (! imapValidator.requiredAttachmentsPresent(msgWithBody, configuration) ){
                //     msgWithBody.err = (msgWithBody.err  || '') +'Missing required attachments.\n';
                // }

                if (typeof msgWithBody.err != 'undefined') {
                    delete msgWithBody.attachmentPromises;
                    return Promise.resolve(msgWithBody);
                }

                msgWithBody.attachmentCnt = msgWithBody.attachmentPromises.length;
                return retrieveAttachmentData(msgWithBody, paths.notices);
            }))
        })

        .then(done => {
            if (done.length == 0) {
                sconnection.end();
            }
            return Promise.resolve(done);
            // console.log('Done:', done);
        })
        .catch(Err => {
            console.log('messages Err:', Err);
        })
    }) // Connection was successful
    .then(res =>{
        // console.log('Done res:', res);
        return Promise.resolve(res);
    })
    .catch(connErr => {
        return Promise.reject('connErr:'+ connErr);
    })
}
//=======================================
function retrieveAttachmentData(msgWithBody, paths) {
    if (msgWithBody.attachmentPromises && msgWithBody.attachmentPromises.length > 0) {
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
    } else {
        delete msgWithBody.attachmentPromises;
        return Promise.resolve(msgWithBody);
    }
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
// https://stackoverflow.com/questions/6398196/node-js-detect-if-called-through-require-or-directly-by-command-line
if (require.main === module) {
    console.log('called directly');
    let imapConf = configuration.imapProcess;
    processSimpleEmail(imaps, {imap: imapConf.imapcredentials}, imapConf.downloadPath )
    .then(emails => {
        emails.map(email => {
            console.log('======================');
            console.log('Processed simple email:' + require('util').inspect(email, { depth: null }));
        })
        // console.log('*** Done.', done);
        process.exit();
    })
    .catch(err => {
        console.log('err:', err);
    })
// } else {
//     console.log('required as a module');
}

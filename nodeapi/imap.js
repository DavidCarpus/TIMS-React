var IPromise = require('imap-promise')
var stream = require('stream');
var base64  = require('base64-stream');
var fs      = require('fs');
var mysql = require('mysql');

// var Config = require('./config'),
// configuration = new Config();
//

var downloadPath='';  //configuration.paths.notices

class IMapProcessor {
    constructor(imapConf, dwnPath){
        this.config = imapConf;
        downloadPath = dwnPath;
        this.connection = null;
        this.imap = new IPromise(this.config);
    }
    process(connection=null) {
        var imapConn = this.imap
        // console.log('Processing email' , connection);
        return processEmail(imapConn, connection)
        // return new Promise(function(resolve, reject) {
        //     .then(process.exit())
        // });
    }
}

module.exports.IMapProcessor = IMapProcessor;

// var connection;
// var imapTest = new IPromise(configuration.imapcredentials);

// =================================================
function getEmailParts(msg) {
    var parts = msg.attributes.struct.reduce((accum, currVal) => {
        if (Array.isArray(currVal)) {
            currVal = [].concat.apply([], currVal);
            accum.push( currVal);
        } else {
            accum.push( currVal);
        }
        accum = [].concat.apply([], accum).filter(elem=>{
            return ('partID' in elem);
        });
        return accum;
    }, [])
    return parts;
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
function fetchPDFAttachment(attachment, msg, imap) {
    return new Promise(function(resolve, reject) {
        let filename = downloadPath + msg.uid + '_' + attachment.disposition.params.filename;
        let encoding = attachment.encoding;
        let attachmentData = msg.pdfs[attachment.partID];
        if (typeof attachmentData == 'undefined' || attachmentData.length == 0) {
            reject('Missing data for ' + msg.uid + ':' + attachment.partID)
        }
        var s = new stream.Readable();
        s.push(attachmentData);
        s.push(null);

        var writeStream = fs.createWriteStream(filename);
        writeStream.on('finish', function() {
            resolve(filename);
            writeStream.end();
        });
        writeStream.on('error', function (err) {
            reject(err);
        });
        writeStream.on('open', function (fd) {
            if (encoding.toUpperCase() === 'BASE64') {
                s.pipe(base64.decode()).pipe(writeStream);
            } else  {
                s.pipe(writeStream);
            }
        })
    })
}
// =================================================
function parseMessageForDBData(msg) {
    var groupNames = ["PublicWorks", "Selectmen", "Recreation"];
    msg.DBData = {mainpage: true, date: new Date(), groupName: 'Main', requestType: 'ADD'};

    return new Promise(function(resolve, reject) {
        msg.bodyTextPart.map( line=>{
            line = line.toUpperCase().trim();
            var groupName = groupNames.indexOf(line.split(' ').join('')); // Remove spaces from the line
            if (groupName >= 0) { msg.DBData.groupName = groupNames[groupName]; }

            dte = Date.parse(line);
            if (dte >= 0 ) {
                if(line.indexOf('EXPIRE') >= 0 ) {
                    msg.DBData.expire = dte;
                } else {
                    msg.DBData.date = dte;
                }
            }
            if(line.indexOf('MAINPAGE') >= 0 ) {
                if (line == 'MAINPAGE') {
                    msg.DBData.mainpage = true;
                } else if(line.indexOf('NO') >= 0 ) {
                    msg.DBData.mainpage = false;
                }
            }
            if (line.startsWith('DESC:') || line.startsWith('DESCRIPTION')) {
                msg.DBData.desc = line;
            }

            if(line.indexOf('AGENDA') >= 0 ) {            msg.DBData.recordtype = 'agenda';        }
            if(line == 'NOTICE' ) {            msg.DBData.recordtype = 'notice';        }
            if(line == 'UPDATE' ) {            msg.DBData.requestType = 'UPDATE';        }
        }) // bodyTextPart.map

        // What is in subject line will overwrite
        var groupName = groupNames.indexOf(msg.Subject.split(' ').join(''));
        if (groupName >= 0) { msg.DBData.groupName = groupNames[groupName]; }
        var dte = Date.parse(msg.subject);
        if (dte >= 0) { msg.DBData.date = dte }

        if (hasAllRequiredData(msg.DBData)) {
            delete msg.bodyTextPart;
            resolve(msg);
        } else {
            reject('Missing data for message ' + msg.uid + ' parsing message body:'+ msg.DBData.error + ' - ' + JSON.stringify(msg.bodyTextPart));
        }
    })
}
// =================================================
function extractPrimaryEmailData(msg) {
    let messageObj={};
    let parts = getEmailParts(msg);

    let textParts = parts.filter(part => {return part.type == 'text' && part.subtype == 'plain'})
    let pdfs = parts.filter(part => {return part.type == 'application' && part.subtype == 'pdf'})

    messageObj = msg.body[0].data.trim().split('\n').reduce((acc, line) => {
        let s = line.trim().split(':');
        acc[s[0].trim()] = s[1].trim()
        return acc;
    },messageObj);

    messageObj.pdfData = pdfs;
    messageObj.seqno = msg.body[0].info.seqno;
    // messageObj.attachments = msg.attachments;
    messageObj.uid = msg.attributes.uid;
    messageObj.textBodyPartID = textParts[0].partID
    messageObj.PDFPartIDs = pdfs.reduce((accum, val)=> {
        accum.push(val.partID);
        return accum;
    },[])
    return messageObj;
}
// =================================================
function getSingleEmail(extractedMsg, imap) {
    let partTEXTID = extractedMsg.textBodyPartID;
    let bodiesStruct = ['TEXT', partTEXTID];
    bodiesStruct = bodiesStruct.concat(extractedMsg.PDFPartIDs); // also Fetch the PDFs

    return imap.getMailAsync(imap.fetch([extractedMsg.uid], {
        bodies: bodiesStruct
    }), function(textBodyMessage){ // For each e-mail:
        extractedMsg.pdfs = {};
        return imap.collectEmailAsync(textBodyMessage)
        .then(function(msgBody){
            msgBody.body.map(body => {
                if (body.info.which == extractedMsg.textBodyPartID) {
                    extractedMsg.bodyTextPart = body.data.trim().split("\n");
                } else if (extractedMsg.PDFPartIDs.indexOf(body.info.which) >= 0) {
                    extractedMsg.pdfs[body.info.which]  = body.data;
                }
            })
            return Promise.resolve(extractedMsg);
        })
        .then(bodyTextMsg => {
            delete bodyTextMsg.textBodyPartID;
            return parseMessageForDBData(bodyTextMsg);
        })
        .then(parsedMsg => {
            return downloadEmailPDFAttachments(parsedMsg, imap)
            .then(results => {
                delete parsedMsg.pdfs;
                delete parsedMsg.PDFPartIDs;
                delete parsedMsg.pdfData;
                parsedMsg.DBData.attachmentLocations = results;
                return Promise.resolve(parsedMsg);
            })
            .catch(dwnErr1 =>{
                // console.log('Error retrieving PDF attachment:' , dwnErr1);
                // return Promise.resolve({error: dwnErr1});
                return Promise.reject('Error retrieving PDF attachment:' + dwnErr1);
            })
        })
        // TODO: Log extract/download error and move email to 'errors' on imap server
        .catch(dwnErr1 => {
            let errMsg = 'Error retrieving email ' + extractedMsg.uid + '-' + dwnErr1;
            // console.log(errMsg);
            return Promise.resolve({error: dwnErr1});
        })
    }) // getMailAsync - body/TEXT
    // .catch(downloadErr3 => {
    //     let errMsg = 'Error asynchronously retrieving email :' + extractedMsg.uid + '-' + downloadErr3;
    //     console.log(errMsg);
    //     return Promise.reject(errMsg);
    // })
}
// =================================================
// TODO: Store data in database
// =================================================
function insertEmailIntoDB(msgData, connection) {
    // if msgData.desc == null and only one file attachment then use filename as desc
    if (msgData.desc == null && msgData.attachmentLocations.length == 1) {
        msgData.desc = msgData.attachmentLocations[0].substring(msgData.attachmentLocations[0].lastIndexOf('/')+1)
        msgData.desc = msgData.desc.substring(msgData.desc.indexOf('_')+1, msgData.desc.lastIndexOf('.'))
    }
    console.log('msgData:' + require('util').inspect(msgData, { depth: null, colors:true }));

}
// =================================================
function processEmail(imap, connection=null) {
    return imap.connectAsync()
    // .then(function(){console.log('connected');})
    .then(function(){return imap.openBoxAsync('INBOX',true);})
    .then(function(box){
        return  imap.getMailAsync(imap.seq.fetch(['1:*'].map(String).join(':'), {
            bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
            struct: true
        }), function(message){ // For each e-mail:
            return (imap.collectEmailAsync(message)
            .then(function(msg){
                return Promise.resolve(extractPrimaryEmailData(msg));
            })
            .then( extractedMsg =>{ // Fetch the message ASCII text body
                return getSingleEmail(extractedMsg, imap)
            })
            .then(results => {
                if (typeof results[0].error != 'undefined' ) { // Errors
                    return new Promise(function(resolve, reject) {
                        reject({error: results[0].error})
                    });
                } else {
                    // if (connection != null) {
                    //         insertEmailIntoDB(results[0].DBData, connection);
                    //     }
                        return Promise.resolve(results[0]);
                }
            })
            .catch(singleErr => {
                // console.log('Error processing email:', singleErr);
                return Promise.resolve(singleErr);
            })
            )// Retrieved given message
        }).catch(getMailAsyncPromiseErr => {
            console.log('Error asynchronously retrieving emails:', getMailAsyncPromiseErr);
        })
    })
    .catch(boxErr => {
        console.log('boxErr:',boxErr);
    })
}
// =================================================
function downloadEmailPDFAttachments(msg, imap) {
    if (msg.pdfData==null || msg.pdfData.length == 0 || msg.pdfs==null || msg.pdfs.length == 0) {
        return Promise.reject("Missing Attachment data.");
    }
    return Promise.all(msg.pdfData.map(attachment => {
            return fetchPDFAttachment(attachment, msg, imap)
        }));
}
 //====================================

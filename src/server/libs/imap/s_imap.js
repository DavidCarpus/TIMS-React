var imaps = require('imap-simple');
var fs      = require('fs');

var Config = require('../../config'),
configuration = new Config();

const partIsAttachment = (part) => part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT'
const partIsPlainText = (part) => part.type == 'text' && part.subtype == 'plain'
const messageIDasFileName = (messageID) => messageID.replace('.','_').replace('@','_').replace('<','').replace('>','').trim()

function retrieveMessages(credentials, mailbox='INBOX') {
    return imaps.connect( credentials )
    .then( sconnection => {
        return sconnection.openBox(mailbox).then( box =>
            sconnection.search(['ALL'], { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true, envelope:true })
        )
        .then(messages =>
            messages.map(message => {
                var parts = imaps.getParts(message.attributes.struct);
                return {// message: message,
                    header: message.attributes.envelope,
                    seqNo: message.seqNo,
                    attachmentPromises : parts.filter( partIsAttachment)
                    .map( part =>sconnection.getPartData(message, part).then( partData => ( {
                            filename: part.disposition.params.filename,
                            tmpPath:configuration.PRIVATE_DIR + '/emailTmp/'
                                + messageIDasFileName(message.attributes.envelope.messageId)
                                + '_'+part.disposition.params.filename,
                            data: partData,
                        }))
                    ),
                    bodyPromise: parts.filter( partIsPlainText )
                    .map( part =>sconnection.getPartData(message, part).then( partData=>({
                        // lines: partData.split('\n'),
                        lines: partData.split('\n').map(line=>line.trim()).join('\n'),
                        }))
                    )
                }
            })
        )
    })
    .then(pulledMessages => {
        return Promise.all(pulledMessages.map(pulledMessage => {
            if(pulledMessage.bodyPromise )
                return pulledMessage.bodyPromise[0]
                .then(bodyData => {
                    delete pulledMessage.bodyPromise
                    return Object.assign({},pulledMessage, {bodyData:bodyData.lines})
                })
            else {
                return Promise.resolve(pulledMessages)
            }
        }))
    })
    .then(pulledMessagesWithBodies => Promise.all(pulledMessagesWithBodies.map(pullAttachments)) )
    .catch(err=> {
        console.log('Err fetching attachments:', '\n***', err);
    })
}
// =================================================
function pullAttachments(message) {
    if(typeof message.attachmentPromises==='undefined' || message.attachmentPromises.length <=0 ) return message

    return Promise.all(message.attachmentPromises.map(attachmentPromise => {
        return attachmentPromise.then(bodyData => (
            {filename:bodyData.filename, tmpPath:bodyData.tmpPath, data:bodyData.data}
        ))
        .then(attachment => new Promise(function(resolve, reject) {
            let writeStream = fs.createWriteStream(attachment.tmpPath);
            writeStream.on('error', function (err) { reject(err); });

            writeStream.on('open', function (fd) {
                writeStream.write(attachment.data);
                writeStream.end();
            })
            writeStream.on('finish', function () {
                delete attachment.data;
                resolve(attachment);
            });
        }))
    }))
    .then(pulledAttachments => {
        delete message.attachmentPromises
        return Object.assign({},message, {attachments:pulledAttachments})
    })
}

const requiresAuthentication = (message) => message.header.subject.indexOf('alert registration') === -1
const doesNotRequireAuthentication = (message) => ! requiresAuthentication(message)

if (require.main === module) {
    const credentials = {imap: configuration.imapProcess.imapcredentials}
    // retrieveMessages(credentials, "INBOX.Tests.Alerts")

    console.log('[');
    retrieveMessages(credentials, "INBOX")
    .then( (results) => {
        // const emailsToProcess = results.filter(doesNotRequireAuthentication)
        const emailsToProcess = results
        emailsToProcess.map( (messageWithPart, index ) => {
            console.log(JSON.stringify(messageWithPart));
            // console.log(require('util').inspect(messageWithPart, { depth: null }));

            if(index+1 !==  emailsToProcess.length) console.log(',');
            return 1
        })
        // console.log('results', require('util').inspect(results, { depth: null }));
    })
    .then( ()=>{
        console.log(']');
        return process.exit()
    })
}

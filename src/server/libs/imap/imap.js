var imaps = require('imap-simple');
var fs      = require('fs');

const partIsAttachment = (part) => part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT'
const partIsPlainText = (part) => part.type == 'text' && part.subtype == 'plain'
const partIsHTML = (part) => part.type == 'text' && part.subtype == 'html'
const messageIDasFileName = (messageID) => messageID.replace('.','_').replace('@','_').replace('<','').replace('>','').trim()
//============================================================
function processMessages(credentials, private_dir, processRoutine, mailbox='INBOX') {
    return imaps.connect( credentials )
    .then( sconnection => {
        return sconnection.openBox(mailbox)
        .then( box =>
            sconnection.search(['ALL'], { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true, envelope:true })
        )
        .then(messages =>{
            return Promise.all(messages.map(message => {
                var parts = imaps.getParts(message.attributes.struct);
                return Promise.all(parts.map( part =>
                    sconnection.getPartData(message, part)
                    .then(partData => {
                        if(partIsAttachment(part)){
                            return {
                                filename: part.disposition.params.filename,
                                tmpPath: private_dir + '/emailTmp/'
                                + messageIDasFileName(message.attributes.envelope.messageId)
                                + '_'+part.disposition.params.filename,
                                data : partData
                            }
                        }
                        else if (partIsPlainText(part)) {
                            return {
                                bodyData: partData.split('\n').map(line=>line.trim()).join('\n')
                            }
                        }
                        else if (partIsHTML(part)) {
                            return null
                        }
                        else {
                            console.log(' ****** Unknown email part ****',{type:part.type , subtype:part.subtype} );
                            return null
                        }
                    })
                ))
                .then(partsRetrieved =>{
                    return partsRetrieved.filter(item=>item!==null).reduce( (acc, val) => {
                        if(typeof val.filename  !== 'undefined'){
                            acc.attachments.push(val)
                        }else {
                            acc = Object.assign({}, acc, val)
                        }
                        return acc
                    }, {header: message.attributes.envelope, seqNo: message.seqNo, uid: message.attributes.uid, attachments:[]} )
                })
                .then(allEmailDataRetrieved => {
                    return Promise.all(allEmailDataRetrieved.attachments.map( attachment => {
                        return new Promise(function(resolve, reject) {
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
                        })
                    }))
                    .then( attachmentsWritten => Object.assign({}, allEmailDataRetrieved, {attachments:attachmentsWritten}) )
                })
                .then(readyToProcess => {
                    return processRoutine(readyToProcess)
                })
            }))
        })
    })
}
//===============================================
function moveMessage(credentials, uid, destFolder) {
    // console.log(arguments.callee.name,'moveMessage', uid, destFolder);
    return imaps.connect( credentials )
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
          // return Promise.resolve(uid);
          return Promise.resolve('Moved ' + uid + ' to ' + destFolder + '?')
      })
      .then( (processResults)=> {
          sconnection.end()
          return processResults
      })
   })

}
//===============================================
module.exports.processMessages = processMessages;
module.exports.moveMessage = moveMessage;

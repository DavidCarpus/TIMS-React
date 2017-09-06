var fs      = require('fs');
var imaps = require('imap-simple');

var Config = require('../config'),
configuration = new Config();

var extractHeaderData = require('../libs/imap/helperMethods').extractHeaderData;
var extractDBData = require('../libs/imap/helperMethods').extractDBData;

let cnt=10

process.stdout.setEncoding('utf8');
process.on('uncaughtException', function (err) {
  console.log('IMAP process:' , err);
})

//======================================
const launchedViaCLI = () =>  typeof process.env.SPAWNED === 'undefined'

//======================================
const intervalObj = setInterval(() => {
    let imapConf = configuration.imapProcess;
// console.log('attach:',     configuration.ROOT_DIR + '/' + imapConf.downloadPath.notices);
    processSimpleEmail(imaps, {imap: imapConf.imapcredentials}, imapConf.downloadPath )
    // processSimpleEmail(imaps, {imap: this.config}, this.downloadPaths)
}, 10 * 1000); // seconds * 1000 milsec

// console.log(intervalObj);

process.stdin.on('data', function (text) {
    let obj = JSON.parse(text);
   // console.log('Rec. data:', require('util').inspect(obj, { depth: null }));
   if (obj.test > 20) {
       process.exit();
    //    cnt=-1
   }
 });


 function processSimpleEmail(imapLib, credentials, paths) {
    //  console.log('processSimpleEmail');
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

         // .then(withAttachPromises => { // quick validate email envelope
         //     return imapValidator.validateHostOrigins(withAttachPromises);
         // })

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
                 // if (! imapValidator.hasAllRequiredData(msgWithBody) ){
                 //     msgWithBody.err = (msgWithBody.err  || '') + 'Missing required information.(date, type, group, etc..).\n';
                 // }
                 // if (! imapValidator.requiredAttachmentsPresent(msgWithBody, configuration) ){
                 //     msgWithBody.err = (msgWithBody.err  || '') +'Missing required attachments.\n';
                 // }

                 if (typeof msgWithBody.err != 'undefined') {
                     delete msgWithBody.attachmentPromises;
                     return Promise.resolve(msgWithBody);
                 }

                 msgWithBody.attachmentCnt = msgWithBody.attachmentPromises.length;
                 return retrieveAttachmentData(msgWithBody, configuration.ROOT_DIR + '/' + paths.notices);
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
 //=======================================
 function retrieveAttachmentData(msgWithBody, path) {
     if (msgWithBody.attachmentPromises && msgWithBody.attachmentPromises.length > 0) {
         return Promise.all(msgWithBody.attachmentPromises)
         .then(retrievedAttachmentData => {
             delete msgWithBody.bodyData;  //No need to keep as we have required field data
             msgWithBody.attachmentLocations = [];
             return Promise.all(retrievedAttachmentData.map(attach => {
                 return writeAttachment(attach, path)
                 .then(writtenAttachment => {
                     msgWithBody.attachmentLocations = msgWithBody.attachmentLocations.concat(writtenAttachment.filename);
                    //  console.log('Wrote: ', msgWithBody.attachmentLocations);
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


 if (require.main === module) {
     const index=2;
     launchedViaCLI() && console.log('debug via cli');
    //  launchedViaCLI() || console.log('Spawned');

     let imapConf = configuration.imapProcess;
     processSimpleEmail(imaps, {imap: imapConf.imapcredentials}, imapConf.downloadPath )
     .then(emails => {
         launchedViaCLI() &&  emails.map(email => {
             console.log('======================');
             console.log('Processed simple email:\n' + require('util').inspect(email, { depth: null }));
         })
         launchedViaCLI() || emails.map(email => {
            //  console.log('======================');
            // email.extra = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." +
            // "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." +
            // "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            console.log(JSON.stringify(email));
            // console.log(JSON.stringify(email)+'\n\n');
            // console.log(JSON.stringify(email)+'\n\n');
         })
         // console.log('*** Done.', done);
         launchedViaCLI() &&  process.exit();
     })
     .catch(err => {
         console.log('err:', err);
         launchedViaCLI() &&  process.exit();
     })
 // } else {
 //     console.log('required as a module');
 }

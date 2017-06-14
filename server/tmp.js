var mysql = require('mysql');
var Config = require('./config'),
configuration = new Config();

var IMapProcessor = require('./libs/imap').IMapProcessor;
let imap = new IMapProcessor(configuration.imapProcess);

var emailSubmit = require('./libs/emailProcessors').submit;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function imapProcess(delay, count=2) {
    imap.process()
    .then(results => {
        return Promise.all(results.map(entry => {
            return emailSubmit(entry, imap);
        }))
    })
    .then(processedEmails => {
        return Promise.all(processedEmails.map(insertedEmail => {
            let destFolder = 'Processed';
            // console.log('DB processed email:', insertedEmail);
            if (typeof insertedEmail[0].err != 'undefined') { destFolder = 'Errors';}
            if (typeof insertedEmail[0].id == 'undefined') {
                err = 'Email not processed to DB. (Missing ID)';
                throw new Error(err)
            }
            return Promise.resolve(imap.archiveMessage(insertedEmail[0].uid, destFolder));
        }))
    })

    .then(entryResults => {
        console.log('Processed emails');
        // console.log("Completed imap.process." , entryResults);
        if (count == -99) {
            console.log('Count set to -99. Triggering exit');
            process.exit();
        }
        return sleep(delay).then(out =>{
            if (count > 0) {
                --count;
                if (configuration.imapProcess.infinite) {
                    ++count;
                }
                return imapProcess(delay, count)
            } else {
                process.exit();
            }
        })
    })

    .catch(err => {
        console.log('IMAP processing error:' + err);
        process.exit();
    })
}
// console.log('configuration.imapProcess:' , configuration.imapProcess);
// console.log('configuration.imapcredentials.user:' , configuration.imapcredentials.user);


imapProcess(configuration.imapProcess.delay, -99);
// console.log("Exited imap.process.");

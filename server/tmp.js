var mysql = require('mysql');
var Config = require('./config'),
configuration = new Config();

var IMapProcessor = require('./libs/imap').IMapProcessor;
let imap = new IMapProcessor(configuration.imapProcess);

var emailSubmit = require('./libs/emailProcessors').submit;
var sendAutomationEmail = require('./libs/emailProcessors/common').sendAutomationEmail;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function imapProcess(delay, count=2) {
    imap.process()
    .then(imapResults => {
        // console.log('imapProcess imapResults:' + require('util').inspect(imapResults, { depth: null }));
        // console.log('--------------');
        return Promise.all(imapResults.map(entry => {
            return emailSubmit(entry, imap)
            .catch(submissionError => {
                console.log('submissionError:' , submissionError);
                return Promise.resolve(entry)
            });
        }))
    })
    .then(processedEmails => {
        console.log('processedEmails:' + require('util').inspect(processedEmails, { depth: null }));
        return Promise.all(processedEmails.map(insertedEmail => {
            let singleEmail = insertedEmail;
            if (Array.isArray(singleEmail)) {                singleEmail = singleEmail[0];            }
            if (Array.isArray(singleEmail)) {                singleEmail = singleEmail[0];            }

            console.log('ID:', singleEmail);
            if (typeof singleEmail.err !== 'undefined' || typeof singleEmail.id === 'undefined') {
                console.log('****' , singleEmail.err);
                return sendAutomationEmail(singleEmail.header.from,
                    {subject:"RE:" + singleEmail.header.subject,
                    text:'ERROR:' + '\n' + singleEmail.err.join('\n') + '\n' + '==================\n' + singleEmail.bodyData})
                .then( mailSent =>{
                    return Promise.resolve(imap.archiveMessage(singleEmail.uid, 'Errors'));
                })

                err = 'Email not processed to DB.' + JSON.stringify(singleEmail);
                console.log(err);
            }
            return Promise.resolve(imap.archiveMessage(singleEmail.uid, 'Processed'));
        }))
    })
    .then(entryResults => {
        if (entryResults.length > 0 ) {
            console.log('Processed emails');
        }

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

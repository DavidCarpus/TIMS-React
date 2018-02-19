var express = require('express');
var bodyParser = require('body-parser')
var router = express.Router();              // get an instance of the express Router
var Config = require('../config'),
configuration = new Config();

const launchedViaCLI = () =>  typeof process.env.SPAWNED === 'undefined'

var knexConfig = require('../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

const {processMessages, moveMessage} = require('../libs/imap')
const {processEmailMessage, successEmail} = require('../libs/imap/processors/Processing')

var sendAutomationEmail = require('../libs/common').sendAutomationEmail;
var verifyAlertRequests = require('../../libs/AlertRequests').verifyAlertRequests

const emailProcessPort = configuration.expressPort+1

const debugLog =(...args)=> {
    process.stdout.write('{"' +args[0] + '": [');
    process.stdout.write(args.splice(1).map(arg=> require('util').inspect(arg, { depth: null })).join(' '))
    console.log(']');
}

//---------------------------------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
//---------------------------------------------
process.stdout.setEncoding('utf8');
process.on('uncaughtException', function (err) {
  debugLog('Email process:' , err);
})
//---------------------------------------------
var app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
//---------------------------------------------
router.get('/alertVerificationProcess', function(req, res) {
    var data = req.body;
    verifyAlertRequests(knex)
    .then(requests => {
        debugLog('requests',requests);
        res.json({msg:'alertVerificationProcess'});
    })
});

app.use('/api', router);

//===================================
function fileValidMessage(message) {
    const credentials = {imap: configuration.imapProcess.imapcredentials}
    const emailUID = message.uid
    // console.log(message.processor, emailUID , require('util').inspect(message.results, { depth: null, colors:true }));
    debugLog(arguments.callee.name, message.processor, emailUID , message.results);
    const emailResponse = successEmail(message)
    if(emailResponse.length > 0) debugLog('emailResponse', emailResponse );
    return moveMessage(credentials, emailUID, 'Processed')
}
//===================================
function fileInValidMessage(message) {
    const credentials = {imap: configuration.imapProcess.imapcredentials}
    const emailUID = message.emailMessageData.uid
    debugLog(arguments.callee.name, message.processor, emailUID , message.error);
    // debugLog('*** Err ***:', emailUID , message.processor,require('util').inspect(message.error, { depth: null, colors:true }));
    return moveMessage(credentials, emailUID, 'Errors')
}
//===================================
function imapProcess(delay, count=2) {
    const credentials = {imap: configuration.imapProcess.imapcredentials}
    processMessages(credentials, configuration.PRIVATE_DIR , processEmailMessage, "INBOX") // "INBOX.Tests.Alerts"
    .then(messagesProcessed=> {
        // console.log('messagesProcessed', messagesProcessed);
        return Promise.all(messagesProcessed.map(messageResult=> Promise.all(
            messageResult.filter(message=>typeof message.results !== 'undefined').map(fileValidMessage)
            .concat(messageResult.filter(message=>typeof message.error !== 'undefined').map(fileInValidMessage))
        )))
    })
    .then( (result)=> {
        // if(configuration.mode === 'development')
        if(result.length > 0) debugLog('imapProcess:result:cnt:'+count, result);
        return sleep(delay).then(out =>{
            if (count > 0) {
                return imapProcess(delay, ++count)
            }
        })
    })

}
//---------------------------------------------
function old_imapProcess(delay, count=2) {
    // debugLog('imapProcess', count);
    imap.process()
    .then(pulledEmails => {
        // debugLog('pulledEmails',require('util').inspect(pulledEmails, { depth: null }));
        // debugLog('pulledEmails', pulledEmails.length);
        return Promise.all(pulledEmails.map((email,index)=> {
            // debugLog('pulledEmails',index,require('util').inspect(email, { depth: null }));
            return emailSubmit(email, imap)
            .then(submissionResult => {
                debugLog('-----------');
                // debugLog('submissionResult',submissionResult);
                const entry = Array.isArray(submissionResult) ? submissionResult[0]:submissionResult
                if (typeof entry.err !== 'undefined' || typeof entry.id === 'undefined') {
                    debugLog('****' , entry);
                    const errors = entry.err ? entry.err.join('\n'): "Debug email errors"
                    return sendAutomationEmail(entry.header.from,
                        {subject:"RE:" + entry.header.subject,
                        text:'ERROR:' + '\n' + errors + '\n' + '==================\n' + entry.bodyData})
                    .then( mailSent =>{
                        return Promise.resolve(imap.archiveMessage(entry.uid, 'Errors'));
                    })
                    const msg = 'Email not processed to DB.' + JSON.stringify(submissionResult);
                    Promise.resolve(msg);
                } else {
                    debugLog('Email processed to DB.',submissionResult);
                    return Promise.resolve(imap.archiveMessage(entry.uid, 'Processed'));
                    // return Promise.resolve(msg);
                }
            })
            .catch(submissionError => {
                debugLog('submissionError:' , submissionError);
                return Promise.resolve(email)
            });
        }))
    })
    .then(processPulledEmails => {
        return sleep(delay).then(out =>{
            if (count > 0) {
                return imapProcess(delay, ++count)
            }
        })
    })

}
// console.log('Imap process every', configuration.imapProcess.delay/1000, 'seconds', (configuration.imapProcess.infinite)?'inf.':'NOT inf.' );
// imapProcess(configuration.imapProcess.delay, 50);

debugLog('Starting up emailProcessing');

//======================================
if (require.main === module) {
    const index=2;
    launchedViaCLI() && debugLog('debug via cli');
    debugLog("emailProcessPort", emailProcessPort);
    app.set('port', emailProcessPort);
    app.listen(app.get('port'), 'localhost');
    imapProcess(60000,2)
}

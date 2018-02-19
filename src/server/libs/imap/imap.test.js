const processMessages = require('./imap').processMessages

const processEmailMessage = require('./processors/Processing').processEmailMessage
var Config = require('../../config'),
configuration = new Config();

//===============================================
// =================================================
if (require.main === module) {
    const credentials = {imap: configuration.imapProcess.imapcredentials}
    const stdout = (message) => console.log(JSON.stringify(message) + ',')

    if (process.argv[2] === 'stdout') {
        console.log('[');
        processMessages(credentials, configuration.PRIVATE_DIR , stdout, "INBOX")
        .then( ()=>{
            console.log('{}]');
            return process.exit()
        })
    } else {
        processMessages(credentials, configuration.PRIVATE_DIR , processEmailMessage, "INBOX") // "INBOX.Tests.Alerts"
        .then(messagesProcessed=> {
            messagesProcessed.map(messageResult => {
                const result = messageResult.filter(result=>typeof result.results !== 'undefined')
                if(result.length > 0) console.log('processed ',require('util').inspect(result, { depth: null, colors:true }));
            })
            messagesProcessed.map(messageResult => {
                const result = messageResult.filter(result=>typeof result.error !== 'undefined')
                if(result.length > 0) console.log('Invalid ',require('util').inspect(result, { depth: null, colors:true }));
            })
        })
        .then( ()=> process.exit() )
    }
}

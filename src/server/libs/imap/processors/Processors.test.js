const {processEmailMessage, successEmail} = require('./Processing')
const emailFromEnvBlock = (block) => block[0].mailbox + '@' + block[0].host

const logUnprocessedEmails = false

//=======================================================
//=======================================================
function processData(testData) {
    const start=0 // .slice(start,start+1)
    return Promise.all(testData.filter(msg=>typeof msg.header !== 'undefined' ).map( processEmailMessage) )
    .then(processResults =>{
        const processed = (testCaseResults)=> testCaseResults.filter(r=>r.results).length > 0
        const unprocessed = (testCaseResults)=> !processed(testCaseResults)
        const badMessage = (testCaseResults)=> testCaseResults.filter(r=>r.error).length > 0

        return {
            processedResults:processResults.filter(processed).map(entry=> entry.filter(e=>e.results)),
            unprocessedResults:processResults.filter(unprocessed).map(entry=> entry[0].emailMessageData ),
            badMessages:processResults.filter(badMessage).map(entry=> entry.filter(e=>e.error))
        }
    })
}
//=======================================================
if (require.main === module) {
    if (process.argv[2] !== undefined) {
        const testData = require(process.cwd()+'/'+process.argv[2]);
        const logResult = (resultType, msg  ) => {
            switch (resultType) {
                case 'SUCCESS':
                    console.log(resultType, require('util').inspect(msg, { depth: null, colors:true }));
                    break;
                case 'ERR':
                    console.log('ERROR:', require('util').inspect(
                        { error:msg.error, from:emailFromEnvBlock(msg.emailMessageData.header.from) ,
                            subject:msg.emailMessageData.header.subject}, { depth: null, colors:true }));
                    break;
                case 'UNPROCESSED':
                    if(logUnprocessedEmails){
                        console.log('***** unprocessedResults *****\n', msg, '\n*****');
                        // console.log(require('util').inspect(complete.unprocessedResults, { depth: null, colors:true }));
                    }
                    break;
                default:

            }
        }

        processData(testData)
        .then(complete => {
            // complete.processedResults.map(msg=>logResult('SUCCESS', msg))
            // complete.unprocessedResults.map(msg=>logResult('UNPROCESSED', msg))
            complete.badMessages.map(msg=>logResult('ERR', msg[0]))
            return process.exit()
        }
        )
        .catch(err=> console.log('err',err))
    }
}

const processEmailMessage = require('./Processing').processEmailMessage
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
        // console.log('process', process.cwd()+'/'+process.argv[2]);
        const testData = require(process.cwd()+'/'+process.argv[2]);

        processData(testData)
        .then(complete => {
            if(complete.processedResults.length > 0) console.log(require('util').inspect(complete.processedResults, { depth: null, colors:true }));

            if(logUnprocessedEmails && complete.unprocessedResults.length > 0){
                console.log('***************');
                console.log('unprocessedResults');
                console.log(complete.unprocessedResults);
                // console.log(require('util').inspect(complete.unprocessedResults, { depth: null, colors:true }));
                console.log('***************');
            }
            const errors = complete.badMessages.map(message=>({
                    error:message[0].error, from:emailFromEnvBlock(message[0].emailMessageData.header.from) , subject:message[0].emailMessageData.header.subject
            }))
            if(errors.length > 0){
                console.log('badMessages:', require('util').inspect(errors, { depth: null, colors:true }));
            }

            return process.exit()
        }
        )
        .catch(err=> console.log('err',err))
    }
}

const AlertRequests = require('./AlertRequests').default
const Organizations = require('./Organizations').default
const MeetingDocument = require('./MeetingDocument').default
const GroupDocuments = require('./GroupDocuments').default
const GroupHelpfulInformation = require('./GroupHelpfulInformation').default
const News = require('./News').default

const {     senderAuthenticate, emailFromEnvBlock} = require('./Util')

const logUnprocessedEmails = false

const processors = [
    // new AlertRequests(),
    // new GroupDocuments(),
    // new GroupHelpfulInformation(),

    // new MeetingDocument(),
    // new Organizations(),
    new News(),
]

//=======================================================
function processData(testData) {
    const start=0 // .slice(start,start+1)
    return Promise.all(testData.map( testCase =>{
        return Promise.all(processors.map( processor => {
            return processor.validData(testCase)
            .then(valid => {
                if(valid){
                    if(processor.requiresAuthentication(testCase) && !senderAuthenticate(testCase)){
                        return Promise.resolve({processor:processor.name, error:"Invalid Sender", testCase:testCase})
                    }
                    return processor.processMessage(testCase)
                    .then(processorResults => {
                        return {processor:processor.name,
                            results:processorResults,
                            from:testCase.header.from
                        }
                    })
                }
                return Promise.resolve({processor:processor.name, testCase:testCase})
            })
            .catch(err=> {
                return Promise.resolve({processor:processor.name, error:err, testCase:testCase})
            })
        }))
    }))
    .then(processResults =>{
        const processed = (testCaseResults)=> testCaseResults.filter(r=>r.results).length > 0
        const unprocessed = (testCaseResults)=> !processed(testCaseResults)
        const badMessage = (testCaseResults)=> testCaseResults.filter(r=>r.error).length > 0

        return {
            processedResults:processResults.filter(processed).map(entry=> entry.filter(e=>e.results)),
            unprocessedResults:processResults.filter(unprocessed).map(entry=> entry[0].testCase ),
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
            console.log(require('util').inspect(complete.processedResults, { depth: null, colors:true }));

            if(logUnprocessedEmails && complete.unprocessedResults.length > 0){
                console.log('***************');
                console.log('unprocessedResults');
                console.log(complete.unprocessedResults);
                // console.log(require('util').inspect(complete.unprocessedResults, { depth: null, colors:true }));
                console.log('***************');
            }
            const errors = complete.badMessages.map(message=>({
                error:message[0].error, from:emailFromEnvBlock(message[0].testCase.header.from) , subject:message[0].testCase.header.subject
            }))
            if(errors.length > 0){
                console.log('badMessages:', require('util').inspect(errors, { depth: null, colors:true }));
            }

            return process.exit()
        }
        )
    }
}

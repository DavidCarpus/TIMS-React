const AlertRequests = require('./AlertRequests').default
const Organizations = require('./Organizations').default
const MeetingDocument = require('./MeetingDocument').default
const GroupDocuments = require('./GroupDocuments').default
const GroupHelpfulInformation = require('./GroupHelpfulInformation').default
const Notices = require('./Notices').default


const processors = [
    new AlertRequests(),
    new Organizations(),
    new MeetingDocument(),
    new GroupDocuments(),
    new GroupHelpfulInformation(),
    new Notices(),
]

//=======================================================
function processData(testData) {
    // const start=3 .slice(start,start+1)
    return Promise.all(testData.map( testCase =>{
        return Promise.all(processors.map( processor => {
            return processor.validData(testCase)
            .then(valid => {
                if(valid){
                    return processor.processMessage(testCase)
                    .then(processorResults => {
                        return {processor:processor.name,
                            requiresAuthentication:processor.requiresAuthentication(testCase),
                            results:processorResults,
                            from:testCase.header.from
                        }
                    })
                }
                return Promise.resolve({processor:processor.name, testCase:testCase})
            })
        }))
        .catch(err=> {
            console.log('Err in ', testCase, '\n***', err);
        })
    }))
    .then(processResults =>{
        const processed = (testCaseResults)=> testCaseResults.filter(r=>r.results).length > 0
        const unprocessed = (testCaseResults)=> !processed(testCaseResults)
        const unprocessedResults = processResults.filter(unprocessed).map(entry=> entry[0].testCase )
        const processedResults = processResults.filter(processed).map(entry=> entry.filter(e=>e.results))
        // return 1
        // return {unprocessedResults:unprocessedResults}
        return {processedResults:processedResults, unprocessedResults:unprocessedResults}

        // return processResults
    })
}
//=======================================================
if (require.main === module) {
    if (process.argv[2] !== undefined) {
        console.log('process', process.cwd()+'/'+process.argv[2]);
        const testData = require(process.cwd()+'/'+process.argv[2]);

        processData(testData)
        .then(complete => {
            console.log(require('util').inspect(complete.processedResults, { depth: null, colors:true }));
            // console.log(require('util').inspect(complete.unprocessedResults, { depth: null, colors:true }));
            if(complete.unprocessedResults.length > 0){
                console.log('***************');
                console.log('unprocessedResults');
                console.log(complete.unprocessedResults);
                console.log('***************');
            }
            return process.exit()
        }
        )
    }
}

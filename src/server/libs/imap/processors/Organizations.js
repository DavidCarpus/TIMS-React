const {
    extractDateFromLines,
    getGroupNameFromTextLine,
} = require('./Util')

class Processor {
    constructor(){
        this.name ="Organizations"
    }
    requiresAuthentication(message){ return requiresAuthentication(message) }
    validData(message) {return validData(message)}
    processMessage(message) {return processMessage(message)}
}

module.exports = {
    requiresAuthentication:requiresAuthentication,
    validData : validData,
    processMessage : processMessage,
    default: Processor
}
//======================================================
//======================================================
function requiresAuthentication(message){
    return true
}
//======================================================
function validData(message) {
    return extractRequestFromEmail(message)
    .then(extractedData=> {
        if(!extractedData.action) return false
        return ['ADD', 'DELETE', 'UPDATE'].includes(extractedData.action)
    })
}
//======================================================
function processMessage(message) {
    return extractRequestFromEmail(message)
}
//======================================================
function extractRequestFromEmail(message) {
    const textLines = message.bodyData.split('\n').concat(message.header.subject)
    return Promise.all( textLines.map( getGroupNameFromTextLine ))
    .then( groupNames => {
        const baseDate =  extractDateFromLines(textLines)
        return {
            submitDate:new Date(message.header.date),
            date:baseDate,
            subject:message.header.subject,
            body:message.bodyData.split('\n'),
            groupName:groupNames.reduce( (acc,val)=> val !== null? val:acc),
        }
    })
}
//======================================================
//======================================================
if (require.main === module) {
    if (process.argv[2] !== undefined) {
        console.log('process', process.argv[2]);
        const testData = require(process.cwd()+'/'+process.argv[2]);
        const processor = new Processor()
        // testData.filter( validData).map( testCase =>{
        //     processMessage(testCase)
        // })
        testData.filter( processor.validData).map( testCase =>{
            processor.processMessage(testCase)
        })
    }
}

const {
    getGroupNameFromTextLine,
    expireableMessageData,
} = require('./Util')

//==============================================
class Processor {
    constructor(){
        this.name ="GroupHelpfulInformation"
    }
    requiresAuthentication(message){ return requiresAuthentication(message) }
    validData(message) {return validData(message)}
    processMessage(message) {return processMessage(message)}
}
//==============================================
module.exports = {
    requiresAuthentication:requiresAuthentication,
    validData : validData,
    processMessage : processMessage,
    default: Processor
}
//==============================================
//==============================================
function requiresAuthentication(message){
    return true
}
//==============================================
function validData(message) {
    return extractRequestFromEmail(message)
    .then(extractedData=> {
        if(extractedData.attachmentCount > 0) return false;
        if(extractedData.body.join('\n').trim().length === 0) return false;
        if(extractedData.body.join('\n').trim().toUpperCase().indexOf('HTTP') === -1) return false
        return true
    })
}
//==============================================
function processMessage(message) {
    return extractRequestFromEmail(message)
}
//==============================================
function extractRequestFromEmail(message) {
    const textLines = message.bodyData.split('\n').concat(message.header.subject)
    return Promise.all( textLines.map( getGroupNameFromTextLine ))
    .then( groupNames => {
        return expireableMessageData(groupNames, message, textLines)
    })
}
//==============================================
//==============================================
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

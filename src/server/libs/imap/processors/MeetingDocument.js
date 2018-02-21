const {
    extractDateFromLines,
    getGroupNameFromTextLine,
    extractExpirationDateFromLine,
    mainPageFlagSet,
    expireableMessageData,
    moveAttachments,
} = require('./Util')

var logGroupDocumentRecord = require('../../../../libs/PublicDocs').logGroupDocumentRecord;

var knexConfig = require('../../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

class Processor {
    constructor(){
        this.name ="MeetingDocument"
    }
    requiresAuthentication(message){ return requiresAuthentication(message) }
    validData(message) {return validData(message)}
    processMessage(message) {return processMessage(message)}
    successEmail(message) {return successEmail(message)}
}

module.exports = {
    requiresAuthentication:requiresAuthentication,
    validData : validData,
    processMessage : processMessage,
    default: Processor
}
//==============================================
//==============================================
const jsUcfirst=(string) => string.charAt(0).toUpperCase() + string.slice(1);
//==============================================
function requiresAuthentication(message){
    return true
}
function successEmail(message) {
    const mdy = `${message.results[0].date.getUTCMonth()+1}/${message.results[0].date.getDate()}/${message.results[0].date.getUTCFullYear()}`
    return `Successfully submitted ${message.results[0].recordType} for ${mdy} ${message.results[0].pageLink} meeting.`
}

//==============================================
function validData(message) {
    return extractRequestFromEmail(message)
    .then(extractedData=> {
        if(extractedData.attachmentCount <= 0) return Promise.resolve(false);
        if(!extractedData.documentType) return Promise.resolve(false);
        return Promise.resolve(message);
    })
}
//==============================================
function getAttachmentDestinationPath(message, filename) {
    const keyDate = message.date || message.submitDate
    return `${jsUcfirst(message.documentType.toLowerCase())}/${keyDate.getUTCFullYear()}/`+
        `${message.groupName}_${keyDate.getUTCFullYear()}_${keyDate.getUTCMonth()+1}_${keyDate.getDate()}.${filename.replace(/.*\./,'')}`
}
//==============================================
//==============================================
function processMessage(message) {
    return extractRequestFromEmail(message)
    .then(messageData=> {
        return moveAttachments(getAttachmentDestinationPath, messageData)
        .then( attachmentLocations => {
            messageData.attachmentLocations = attachmentLocations
            return messageData
        })
        .then(readyForDB=> Promise.all(readyForDB.attachmentLocations.map(location=> {
            const record = {
                pageLink:readyForDB.groupName,
                date:readyForDB.date || readyForDB.submitDate,
                expiredate:readyForDB.expires,
                recordType: jsUcfirst(readyForDB.documentType.toLowerCase()),
                fileLink: location.relativePath,
                recorddesc:location.description || jsUcfirst(readyForDB.documentType.toLowerCase()),
                mainpage: readyForDB.mainpage,
                // TODO:  // action: ['ADD','REPLACE']
            }
            return logGroupDocumentRecord(knex, record);
        })))
    })

}
//==============================================
function getDocumentTypeFromLines(lines) {
    return lines.reduce( (acc,val) => {
        if(['AGENDA', 'MINUTES'].includes(val.toUpperCase() ))
            acc = val.toUpperCase()
        return acc
    }, "")
}
//==============================================
function extractRequestFromEmail(message) {
    const textLines = message.bodyData.split('\n').concat(message.header.subject)
    return Promise.all( textLines.map( getGroupNameFromTextLine ))
    .then( groupNames => {
        return Object.assign(
            expireableMessageData(groupNames, message, textLines),
            {documentType: getDocumentTypeFromLines(textLines)}
        )
    })
}
//==============================================
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

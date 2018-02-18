const {
    getGroupNameFromTextLine,
    expireableMessageData,
    moveAttachments,
} = require('./Util')

var logGroupDocumentRecord = require('../../../../libs/PublicDocs').logGroupDocumentRecord;

var knexConfig = require('../../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

class Processor {
    constructor(){
        this.name ="News"
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
        if(extractedData.attachmentCount <= 0) return false;
        if(!extractedData.documentType) return false;
        return true
    })
}
//======================================================
function getAttachmentDestinationPath(message, filename) {
    const keyDate = message.date || message.submitDate
    return `News/${message.groupName}_${keyDate.getUTCFullYear()}_${keyDate.getUTCMonth()+1}_${keyDate.getDate()}.${filename.replace(/.*\./,'')}`
}
//======================================================
const recorddescFromFileName = (filename) => "News - " + filename.slice(0, filename.lastIndexOf('.') ).replace('_', ' ')
//======================================================
function processMessage(message) {
    return extractRequestFromEmail(message)
    .then(messageData=> {

        return moveAttachments(getAttachmentDestinationPath, messageData)
        .then( attachmentLocations => {
            messageData.attachmentLocations = attachmentLocations
            delete messageData.attachments
            return messageData
        })
        .then(readyForDB=> Promise.all(readyForDB.attachmentLocations.map(location=> {
            const record = {
                pageLink:readyForDB.groupName,
                date:readyForDB.date || readyForDB.submitDate,
                expiredate:readyForDB.expires,
                recordType: 'News',
                fileLink: location.relativePath,
                recorddesc:location.description || message.description || recorddescFromFileName(location.filename),
                mainpage: readyForDB.mainpage,
            }
            return logGroupDocumentRecord(knex, record);
        })))


        delete messageData.body
        delete messageData.attachmentCount
        return messageData
    })
}
//======================================================
function getDocumentTypeFromLines(lines) {
    return lines.reduce( (acc,val) => {
        if(['NEWS'].includes(val.toUpperCase() ))
            acc = val.toUpperCase()
        return acc
    }, "")
}
//======================================================
function extractRequestFromEmail(message) {
    const textLines = message.bodyData.split('\n').concat(message.header.subject)
    return Promise.all( textLines.map( getGroupNameFromTextLine ))
    .then( groupNames => {
        const documentType = getDocumentTypeFromLines(textLines)
        if(documentType==='NEWS'){
            console.log(arguments.callee.name,message);
            console.log('----------');
        }
        // console.log('extractRequestFromEmail:message', message);
        return Object.assign(
            expireableMessageData(groupNames, message, textLines),
            {documentType: getDocumentTypeFromLines(textLines)}
        )
    })
}
//======================================================
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

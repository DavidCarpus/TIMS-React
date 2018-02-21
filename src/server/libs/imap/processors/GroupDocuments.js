const {
    extractDateFromLines,
    getGroupNameFromTextLine,
    expireableMessageData,
    moveAttachments,
    documentTypeFromBodyLines
} = require('./Util')

var logGroupDocumentRecord = require('../../../../libs/PublicDocs').logGroupDocumentRecord;

var knexConfig = require('../../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

const emailFromEnvBlock = (block) => block[0].mailbox + '@' + block[0].host

class Processor {
    constructor(){
        this.name ="GroupDocuments"
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
function requiresAuthentication(message){
    return true
}
function successEmail(message) {
    // const mdy = `${message.results[0].date.getUTCMonth()+1}/${message.results[0].date.getDate()}/${message.results[0].date.getUTCFullYear()}`
    return `Successfully submitted document "${message.results[0].recorddesc}" for ${message.results[0].pageLink}.`
}
//==============================================
function validData(message) {
    return extractRequestFromEmail(message)
    .then(extractedData=> {
        if(extractedData.attachmentCount <= 0) return Promise.resolve(false);
        if(documentTypeFromBodyLines(extractedData.body).length !== 0) {
            return Promise.resolve(false);
        }
        if(extractedData.action.length > 1) {
            return Promise.reject('To many actions:' + extractedData.action)
        }
        if(extractedData.body.join('\n').trim().length === 0) return Promise.resolve(message);
        return Promise.resolve(false);
    })
}
//==============================================
function getAttachmentDestinationPath(message, filename) {
    return `Documents/${message.groupName}_${message.submitDate.getUTCFullYear()}_${message.submitDate.getUTCMonth()+1}_${filename}`
}
//==============================================
function getAction(message) {
    const textLines = message.bodyData.split('\n').concat(message.header.subject).concat('ADD').concat('REPLACE')
    const actions = textLines.filter((line) => [/^ADD$/i, /^REPLACE$/i, /^REMOVE$/i].reduce( (acc, val)=> acc || line.match(val), false))
    if (actions.length === 0) return ["ADD"]
    return actions
    // if(actions.length > 1) throw new Error("More than one action (ADD, REPLACE) provided. ")
}
//==============================================
function processMessage(message) {
    return extractRequestFromEmail(message)
    .then(messageData=> {
        return moveAttachments(getAttachmentDestinationPath, messageData)
        .then( attachmentLocations => {
            messageData.attachmentLocations = attachmentLocations
            return messageData
        })
        .then(readyForDB=> {
            delete readyForDB.body
            delete readyForDB.attachmentCount
            delete readyForDB.attachments

            return Promise.all(readyForDB.attachmentLocations.map(location=> {
                return logGroupDocumentRecord(knex, {
                    pageLink:readyForDB.groupName,
                    date:readyForDB.date || readyForDB.submitDate,
                    expiredate:readyForDB.expires,
                    recordType: "Document",
                    fileLink: location.relativePath,
                    recorddesc:location.description || location.filename,
                    mainpage: readyForDB.mainpage,
                    action: readyForDB.action,
                });
            }))
        })
    })
}
//==============================================
function extractRequestFromEmail(message) {
    debugger;

    const textLines = message.bodyData.split('\n').concat(message.header.subject)
    return Promise.all( textLines.map( getGroupNameFromTextLine ))
    .then( groupNames => {
        return Object.assign({}, expireableMessageData(groupNames, message, textLines), {action:getAction(message)})
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

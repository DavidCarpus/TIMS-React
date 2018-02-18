var logAlertRequestConfirmation = require('../../../../libs/AlertRequests').logAlertRequestConfirmation;

var knexConfig = require('../../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

const emailFromEnvBlock = (block) => block[0].mailbox + '@' + block[0].host

class Processor {
    constructor(){
        this.name ="AlertRequests"
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
//==============================================
//==============================================
var monthAbbreviations = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
];
//==============================================
function dateStrToDate(datestr) {
    if(datestr === null) return null
    if(datestr.startsWith('Sent:')){
        return new Date(datestr.replace(/.*?,/,''));
    }
    if(datestr.length > 0 ){
        const dateParts = datestr.split(' ')
        const hm = [dateParts[5] === 'PM'? Number(dateParts[4].split(":")[0])+12:dateParts[4].split(":")[0] , dateParts[4].split(":")[1]]
        return new Date(""+dateParts[1].replace(',','') + ' ' + dateParts[0]  + ' ' + dateParts[2]  + ' ' + hm[0] + ':' + hm[1]);
    }
}
//==============================================
function requiresAuthentication(message){
    return false
}
//==============================================
function validData(message) {
    return extractRequestFromEmail(message)
    .then(extractedData=> {
        // console.log('validData?');
        // console.log('extractedData.options: ', Object.keys(extractedData.options).length);
        if (extractedData.alertRequestID <= 0) return false
        if (Object.keys(extractedData.options).length > 0 ) return true
        return false
    })
    // return Promise.resolve(message.header.subject.indexOf('alert registration') !== -1)
}
//==============================================
function processMessage(message) {
    return extractRequestFromEmail(message)
    .then(extractedEmail => logAlertRequestConfirmation(knex, extractedEmail))
}
//==============================================
function getOptionsFromMessage(origEmailLines) {
    if(origEmailLines.length === 0) return []
    return origEmailLines.splice(2).filter(line=>line.indexOf('-') > 0).sort()
        .reduce( (acc,line)=> { // Line is formated as "groupname - recordType, recordType, ..."
            acc[line.split('-')[0].trim()] = line.split('-')[1].split(',').map(rec=>rec.trim())
            return acc
        },[])
}
//==============================================
function getOriginalEmailFromBodyText(body) {
    const bodyLines = body.replace('\r','').split('\n')
    const origEmailLines = bodyLines.filter((line) => line.match( /^>/)).map((line)=>line.replace(/^> ?/, ''))

    const header=body.indexOf('From: website') > 0?
    bodyLines.filter((line) => [/^Sent:/].reduce( (acc, val)=> acc || line.match(val), false)).join('') // SMS responses
    :bodyLines.filter((line) => [/^On.*</, /wrote:$/].reduce( (acc, val)=> acc || line.match(val), false)).join('\n') // Email responses

    return {
        replyRequest:body.indexOf('Please reply')> 0? body.replace(/>/g,'').replace(/\n/g,'').match(/Please reply.*?\:/)[0] :null,
        date:dateStrToDate(header.replace(/^On.*?,/,'').replace(/Website automation.*/,'').trim()),
        origEmailLines:origEmailLines
    }
}
//==============================================
function extractRequestFromEmail(message) {
    const origEmail = getOriginalEmailFromBodyText(message.bodyData)
    const from = emailFromEnvBlock(message.header.from)    // message.header.from[0].match(/.*<(.*)>/)[1].trim(),
    const alertRequestID = message.header.subject.replace(/.*#/,'')
    const submitDate = (new Date(message.header.date)).getUTCFullYear() < 1980? new Date():new Date(message.header.date) // SMS messages have WAY wrong dates

    return Promise.resolve( {
        alertRequestID:Number(alertRequestID),
        validationSentMessageID:message.header.inReplyTo!==null? message.header.inReplyTo.replace(/^</,'').replace(/>$/,''):null,
        contact: from.toUpperCase(),
        header: origEmail.replyRequest,
        submitDate:submitDate,
        messageId: message.header.messageId.replace(/^</,'').replace(/>$/,''),
        options:getOptionsFromMessage(origEmail.origEmailLines),
    } )
}
//==============================================
//==============================================
//==============================================
if (require.main === module) {
    if (process.argv[2] !== undefined) {
        console.log('process', process.argv[2]);
        const testData = require(process.cwd()+'/'+process.argv[2]);
        const processor = new Processor()
        testData.filter( processor.validData).map( testCase =>{
            processor.processMessage(testCase)
        })
    }
}

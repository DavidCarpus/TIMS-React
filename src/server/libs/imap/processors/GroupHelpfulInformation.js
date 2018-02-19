const {
    getGroupNameFromTextLine,
    expireableMessageData,
    getURLFromTextLine,
} = require('./Util')

var logHelpfulInformationRecord = require('../../../../libs/PublicDocs').logHelpfulInformationRecord;

var knexConfig = require('../../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);
//==============================================
class Processor {
    constructor(){
        this.name ="GroupHelpfulInformation"
    }
    requiresAuthentication(message){ return requiresAuthentication(message) }
    validData(message) {return validData(message)}
    processMessage(message) {return processMessage(message)}
    successEmail(message) {return successEmail(message)}
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
function successEmail(message) {
    return `Successfully submitted a HelpfulInformation link for ${message.results[0].pageLink}.`
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
function getLinks(bodyTextLines) {
    const links = bodyTextLines.map(getURLFromTextLine).filter(line=>line!==null)
    if(links.length > 0 ){
        if(bodyTextLines.length > links.length ){
            //TODO: Fetch descriptions from other lines
            console.log('--------------'); console.trace('TDB: Fetch descriptions from other lines'); console.log('--------------');;
            throw new Error('TDB: Fetch descriptions from other lines' );
        }
    }
    const results = links.map(link=>{
        if(link.desc !== null && link.desc.length > 0) return link
        return Object.assign(link, {desc:link.link.slice(link.link.lastIndexOf('/')+1)})
    })
    return results
}
//==============================================
function processMessage(message) {
    return extractRequestFromEmail(message)
    .then(messageData=> Promise.all(getLinks(messageData.body).map(link=> {
        const record = {
            pageLink:messageData.groupName,
            date:messageData.date || messageData.submitDate,
            expiredate:messageData.expires,
            recordType: "HelpfulInformation",
            fileLink: link.link,
            recorddesc:link.desc.length > 0? link.desc: null,
            mainpage: messageData.mainpage,
        }
        return logHelpfulInformationRecord(knex, record)
    })))
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

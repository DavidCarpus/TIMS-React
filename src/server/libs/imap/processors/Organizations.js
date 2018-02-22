const {
    extractDateFromLines,
    getGroupNameFromTextLine,
} = require('./Util')

const actions = [
    {action:'BOARD DELETE', matches: ['BOARD DELETE', 'DELETE BOARD','BOARD REMOVE', 'REMOVE BOARD'] },
    {action:'BOARD ADD', matches: ['BOARD ADD', 'ADD BOARD'] },
    {action:'BOARD UPDATE', matches: ['BOARD UPDATE', 'UPDATE BOARD'] },
    {action:'COMMITTEE ADD', matches: ['COMMITTEE ADD', 'ADD COMMITTEE'] }
]
const orgTypes = [ "Board" ] //, "Committee"
const keyMarkers = [/^DESC:/, /^DESCRIPTION:/, /^BOARD DESCRIPTION:/]

let mergeArrays = (arrays) => [].concat.apply([], arrays)
const onlyUnique = (value, index, self) => self.indexOf(value) === index;

var {updateOrganization,createNewOrganization} = require('../../../../libs/Groups');

var knexConfig = require('../../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);


class Processor {
    constructor(){
        this.name ="Organizations"
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
//======================================================
//======================================================
function requiresAuthentication(message){
    return true
}
//======================================================
function validData(message) {
    return extractRequestFromEmail(message)
    .then(extractedData=> {
        if(!extractedData.action) return Promise.resolve(false);
        if( actions.map(action=>action.action).includes(extractedData.action)){
            return Promise.resolve(message);
        }
    })
}
//======================================================
function processMessage(message) {
    return extractRequestFromEmail(message)
    .then(messageData=> {
        const coreActions = actions.map(action=>action.action.substr(action.action.indexOf(' ')).trim() ).filter(onlyUnique);
        const orgType = orgTypes.reduce( (acc, val) => acc||messageData.action.indexOf(val.toUpperCase()) > -1?val:"" , "")
        const action = coreActions.reduce( (acc, val) => {
            if(messageData.action.indexOf(val.toUpperCase()) > -1)
                acc = val
            return acc
        }, "")

        switch (action) {
            case 'ADD':
                const orgDataToAdd = {type: orgType, name: messageData.groupName, description:messageData.groupDescription}
                return createNewOrganization(knex, orgDatatoAdd )
                .then(createResults=> Object.assign({}, message, {orgData:createResults, action:action }))
                break;
            case 'UPDATE':
                const orgDataToUpdate = {type: orgType, name: messageData.groupName, description:messageData.groupDescription}
                return updateOrganization(knex, orgDataToUpdate )
                .then(updateResults=> Object.assign({}, message, {orgData:updateResults, action:action }))
                break;

            default:
                //TODO: Performing action for organizations not implemented
                console.log('--------------'); console.trace(`TODO: Performing ${action} for organizations not implemented`); console.log('--------------');;
                throw new Error(`TODO: Performing ${action} for organizations not yet implemented` );
        }
    })
}
//======================================================
function successEmail(message) {
    const actionText =[{action:'ADD', text:'new'}, {action:'UPDATE', text:'updated information for'} ].filter(action=>action.action===message.results.action).slice(0)
    return (`Successfully submitted ${actionText.length > 0?actionText[0].text:'new'} Organization: "${message.results.orgData.description}" at location ${message.results.orgData.fullLink}.`);
}
//======================================================
function getActionsFromTextLines(textLines) {
    //expand actions, one per record
    const regExps = actions.reduce( (acc, action) => acc.concat(action.matches.map(match=> ({action:action.action, match:match}) )), [])
    return textLines.map( line=>
        regExps.reduce( (acc, expr) => {
            if(line.match(new RegExp(expr.match, 'i'))) return {action:expr.action, line:line}
            return acc
        }, {})
    ).filter(action=>Object.keys(action).length > 0)
}
//======================================================
function getActionFromTextLines(textLines) {
    const matchedActions = getActionsFromTextLines(textLines)
    if(matchedActions.length > 0) return matchedActions[0].action;
}
//======================================================
function getNewGroupNameFromTextLines(textLines) {
    const matchedActions = getActionsFromTextLines(textLines)
    const groupName = matchedActions.reduce( (acc, val) => {
        return acc || val.line.replace(new RegExp(val.action, "i"), "")
    }, "")
    return groupName.trim()
}
//======================================================
function getNewGroupDescFromTextLines(textLines) {
    const matchingLines = getActionsFromTextLines(textLines).map(action=>action.line)
    const potentialDescriptions = textLines.filter(line=>!matchingLines.includes(line))

    if(potentialDescriptions.length === 0) return getNewGroupNameFromTextLines(textLines).trim()

    return potentialDescriptions.reduce( (descAcc, descVal) => {
        const chk = keyMarkers.reduce( (markerAcc,markerVal) => {
            if(descVal.match(new RegExp(markerVal, 'i'))){
                return descVal.replace(new RegExp(markerVal, 'i'), '')
            }
            return markerAcc.trim()
        }, "")
        return descAcc.trim() || chk
    },"" ) || getNewGroupNameFromTextLines(textLines).trim()

}
//======================================================
function extractRequestFromEmail(message) {
    const textLines = message.bodyData.split('\n').concat(message.header.subject)
    const actionFromLines = getActionFromTextLines(textLines)

    return Promise.all( textLines.map( getGroupNameFromTextLine ))
    .then( groupNames => {
        const groupName = groupNames.reduce( (acc,val)=> val !== null? val:acc) || getNewGroupNameFromTextLines(textLines)
        if(groupName.length === 0) return Promise.reject('Unable to determine new Organization name from message.')

        return {
            submitDate:new Date(message.header.date),
            subject:message.header.subject,
            body:message.bodyData.split('\n'),
            groupName:groupName,
            groupDescription:getNewGroupDescFromTextLines(textLines),
            action: actionFromLines,
        }
    })
}
//======================================================
//======================================================
if (require.main === module) {
    // console.log('getActionFromTextLines', getActionFromTextLines(['BOARD ADD NonExistantBoard', 'Board add', 'Irrelevant line']));
    // console.log('getActionFromTextLines', getActionFromTextLines(['COMMITTEE ADD NonExistantBoard', 'Irrelevant line']));
    // console.log('getNewGroupNameFromTextLines', getNewGroupNameFromTextLines(['BOARD ADD NonExistantBoard', 'Board add', 'Irrelevant line']));
    // console.log('getNewGroupNameFromTextLines', getNewGroupNameFromTextLines(['COMMITTEE ADD NonExistantCommittee', 'Irrelevant line']));

    console.log('getNewGroupDescFromTextLines',
    getNewGroupDescFromTextLines(
        [
            'BOARD ADD NonExistantBoard',
            'Board add',
            'Descriptive name',
            'Desc:More Descriptive name',
            'Description:More Descriptive name2',
    ]));
}

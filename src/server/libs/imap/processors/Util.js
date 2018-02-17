var addMonths = require('date-fns/add_months')
var addDays = require('date-fns/add_days')
var Config = require('../../../config'),
configuration = new Config();

var getServerFilePath = require('../../../serverIO').getServerFilePath;
var pullNewServerDirs = require('../../../serverIO').pullNewServerDirs;
var getSourceServerHost = require('../../../serverIO').getSourceServerHost;
var pushFileToServer = require('../../../serverIO').pushFileToServer;

let loadedGroupNames=[]

const mergeArrays = (arrays) => [].concat.apply([], arrays)
const emailFromEnvBlock = (block) => block[0].mailbox + '@' + block[0].host

//==========================================
function loadGroupNames() {
    if(loadedGroupNames.length === 0){
        // console.log(' *** loading GroupNames');
        loadedGroupNames = require('../GroupNames.json');
    }
    return Promise.resolve(loadedGroupNames)
}

function extractPossibleDatesFromLine(line) {
    const dateExpressions = [
        /(\d\d\d\d)-(\d\d)-(\d\d)/,
        /(\d?\d)[\. -]{1,2}(\d?\d)[\. -]{1,2}(\d\d\d?\d?)[. ]*/,
        /(\d\d\d\d)\.(\d\d)\.(\d\d)/,
    ]
    const dateMatches =  dateExpressions.map( expressionString => {
        const dateSeq = line.match(new RegExp(expressionString))
        if (dateSeq && dateSeq.length >= 4 ) {
            if(Number(dateSeq[1])>31){
                year =Number(dateSeq[1])
                month=Number(dateSeq[2])
                day=Number(dateSeq[3])
            } else {
                year =Number(dateSeq[3]) < 100? Number(dateSeq[3])+2000: Number(dateSeq[3])
                month=Number(dateSeq[1])
                day=Number(dateSeq[2])
            }
            return new Date(year, month-1, day)
        }
        return null
    }).filter(val=>val!==null)
    // console.log('dateMatches',dateMatches);
    return dateMatches
}

function expireableMessageData(groupNames, message, textLines){
    const submitDate = new Date(message.header.date)
    const baseDate =  extractDateFromLines(textLines)
    const extractExpirationDate = (acc, line) => acc || extractExpirationDateFromLine(baseDate || submitDate, line )
    return {
        submitDate:submitDate,
        date:baseDate,
        mainpage: mainPageFlagSet(textLines),
        expires:textLines.reduce( extractExpirationDate ,null),
        subject:message.header.subject,
        body:message.bodyData.trim().split('\n'),
        groupName:groupNames.reduce( (acc,val)=> val !== null? val:acc),
        attachmentCount: message.attachments ? message.attachments.length:0,
        attachments: message.attachments || []
        // action: 'ADD',
    }
}

function mainPageFlagSet(lines) {
    // console.log('mainPageFlagSet');
    return lines.reduce( (acc,val)=> {
        if(val.toUpperCase().indexOf('MAINPAGE') >= 0){
            if (val.trim().length === 'MAINPAGE'.length) acc=acc||true
            else if (val.toUpperCase().indexOf('TRUE') >= 0 ) {
                acc=acc||true
            }
        }
        return acc
    }, false)
}


function extractDateFromLines( lines) {
    const potentialDates = lines.filter(line=> line.toUpperCase().indexOf('EXPIRES') === -1 )
    .map(extractPossibleDatesFromLine)
    .filter(possibles=>possibles.length > 0)
    return (potentialDates.length > 0 && potentialDates[0].length > 0) ? potentialDates[0][0]: null
}

function extractExpirationDateFromLine(baseDate, line) {
    if(line.toUpperCase().indexOf('EXPIRES') === -1 ) return null
    const remainder = line.toUpperCase().replace('EXPIRES', '')
    const val = Number(remainder.replace(/days$/i, ''));
    if (! isNaN(val)) {
        return addDays(baseDate, val)
    }
    return new Date(Date.parse(remainder))
}

function getGroupNameFromTextLine(textLine) {
    let testLine = textLine.toUpperCase().split(' ').join(''); // Remove spaces from the line
    return loadGroupNames()
    .then(groupNames => {
        let foundGroup = groupNames.filter(group => {
            if (testLine == group.primary.toUpperCase()) {return true;}
            let alternatives = group.alternatives.filter(alternative => {
                if (testLine == alternative.toUpperCase()) {return true;}
            })
            if (alternatives.length > 0) {return true; }
            // console.log('alternatives:', alternatives);
            return false;
        })
        return foundGroup.length > 0 ? foundGroup[0].primary: null;
    })
}
//==========================================
function moveAttachments(getDestinationPath, message  ) {
    return pullNewServerDirs(getServerFilePath(), ['Documents'] )
    .then( serverDirs => {
        let allPaths= mergeArrays(serverDirs)
        const notOnServer = (attachment) => !allPaths.includes(getDestinationPath(message, attachment.filename))

        const toPush = message.attachments.filter(notOnServer)

        return Promise.all(toPush.map(attachment => {
            const dest = getDestinationPath(message, attachment.filename)
            return pushFileToServer(attachment.tmpPath, getServerFilePath()+ dest , true)
            .then( pushReq => attachment)
            .catch(err => console.log(err, attachment))
        }))
    })
    .then(pushedFiles=> {
        return message.attachments.map(attachment => ({ filename:attachment.filename , relativePath: getDestinationPath(message, attachment.filename)}))
    })
}
//==========================================
function senderAuthenticate(message) {
    const thisEmalHost = configuration.imapProcess.imapcredentials.user.replace(/.*@/,'')
    if(message.header.from[0].host.toUpperCase() === thisEmalHost.toUpperCase()){
        return true
    }
    // if(message.header.from[0].mailbox.toUpperCase() === 'DAVID.CARPUS'){
    //     return true
    // }
    // console.log('sender', message.header.from[0]);
    return false
}

if (require.main === module) {
    // getGroupNameFromTextLine("BoardofSelectmen")
    // console.log('extractExpirationDateFromLine', extractExpirationDateFromLine(new Date(), 'Expires 20'));
    // console.log('extractExpirationDateFromLine', extractExpirationDateFromLine(new Date(), 'Expires 20 days'));
    // console.log('extractExpirationDateFromLine:addMonths:', extractExpirationDateFromLine(new Date(), 'Expires ' + addMonths(new Date(), 1)));

    // console.log(require('util').inspect(extractPossibleDatesFromLine('2017-09-25'), { depth: null }));
    // console.log(require('util').inspect(extractPossibleDatesFromLine('Expires 2017-09-25'), { depth: null }));
    // console.log(require('util').inspect(mainPageFlagSet(['mainpage']), { depth: null }));
    // console.log(require('util').inspect(mainPageFlagSet(['mainpage true']), { depth: null }));
    // console.log(require('util').inspect(mainPageFlagSet(['mainpage false']), { depth: null }));
    // console.log(require('util').inspect(mainPageFlagSet(['mainpge false']), { depth: null }));

    // getGroupNameFromTextLine("Selectmen")
    // .then(groupName => {
    //     console.log('groupName',groupName);
    //     return process.exit()
    // })
}

module.exports.getGroupNameFromTextLine = getGroupNameFromTextLine
module.exports.extractExpirationDateFromLine = extractExpirationDateFromLine
module.exports.extractDateFromLines = extractDateFromLines
module.exports.mainPageFlagSet = mainPageFlagSet
module.exports.expireableMessageData = expireableMessageData
module.exports.senderAuthenticate = senderAuthenticate
module.exports.emailFromEnvBlock = emailFromEnvBlock
module.exports.moveAttachments = moveAttachments

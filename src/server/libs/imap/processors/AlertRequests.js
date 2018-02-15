
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
}
//==============================================
function getOptionsFromMessage(bodyTextLines) {
    if(bodyTextLines.length === 0) return []

    const matchLine = (line) => [/^On.*</, /wrote:$/, /^>/].reduce( (acc, val)=> acc || line.match(val), false)
    const origEmailLines = bodyTextLines.filter(matchLine).map((line)=>line.replace(/^> ?/, ''))

    const options = origEmailLines.splice(2).filter(line=>line.indexOf('-') > 0).sort()
        .reduce( (acc,line)=> { // Line is formated as "groupname - recordType, recordType, ..."
            acc[line.split('-')[0].trim()] = line.split('-')[1].split(',').map(rec=>rec.trim())
            return acc
        },[])

    return options
}
//==============================================
function extractRequestFromEmail(message) {
    const matchLine = (line) => [/^On.*</, /wrote:$/, /^>/].reduce( (acc, val)=> acc || line.match(val), false)
    const origEmailLines = message.bodyData.replace('\r','').split('\n').filter(matchLine).map((line)=>line.replace(/^> ?/, ''))
    const from = emailFromEnvBlock(message.header.from)    // message.header.from[0].match(/.*<(.*)>/)[1].trim(),
    const alertRequestID = message.header.subject.replace(/.*#/,'')

    return Promise.resolve( {
        alertRequestID:Number(alertRequestID),
        inReplyTo:message.header.inReplyTo,
        contact: from,
        date:message.header.date,
        // header:origEmailLines.join('\n').trim(),
        options:getOptionsFromMessage(message.bodyData.replace('\r','').split('\n')),
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

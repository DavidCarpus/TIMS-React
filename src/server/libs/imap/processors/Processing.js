const AlertRequests = require('./AlertRequests').default
const Organizations = require('./Organizations').default
const MeetingDocument = require('./MeetingDocument').default
const GroupDocuments = require('./GroupDocuments').default
const GroupHelpfulInformation = require('./GroupHelpfulInformation').default
const News = require('./News').default

const {     senderAuthenticate, emailFromEnvBlock} = require('./Util')

const processors = [
    new AlertRequests(),
    new GroupDocuments(),
    new GroupHelpfulInformation(),
    new News(),
    new MeetingDocument(),
    new Organizations(),
]

function successEmail(emailMessageData) {
    return processors.filter(processor=>processor.successEmail && emailMessageData.processor === processor.name)
    .reduce( (acc, processor) => {
        return acc+(emailMessageData.processor === processor.name)? processor.successEmail(emailMessageData):""
    }, "")
}

function processEmailMessage(emailMessageData) {
    return Promise.all(processors.map( processor => {
        return processor.validData(emailMessageData)
        .then(validatedData => {
            if(validatedData){
                if(processor.requiresAuthentication(validatedData) && !senderAuthenticate(validatedData)){
                    return Promise.resolve({processor:processor.name, error:"Invalid Sender", emailMessageData:validatedData})
                }
                return processor.processMessage(validatedData)
                .then(processorResults => {
                    return Promise.resolve({processor:processor.name,
                        results:processorResults,
                        from:validatedData.header.from,
                        uid: validatedData.uid,
                    })
                })
            } else {
                return Promise.resolve({processor:processor.name, emailMessageData:emailMessageData})
            }
        })
        .catch(err=> {
            return Promise.resolve({processor:processor.name, error:err, emailMessageData:emailMessageData})
        })
    }))
}

module.exports.processEmailMessage = processEmailMessage;
module.exports.successEmail = successEmail;

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

    // new Organizations(),
]

function successEmail(emailMessageData) {
    // console.log('successEmail:emailMessageData', emailMessageData);
    return processors.filter(processor=>processor.successEmail && emailMessageData.processor === processor.name)
    .reduce( (acc, processor) => {
        return acc+(emailMessageData.processor === processor.name)? processor.successEmail(emailMessageData):""
    // }, emailMessageData.processor)
    }, "")
}

function processEmailMessage(emailMessageData) {
    // console.log('emailMessageData',emailMessageData);
    return Promise.all(processors.map( processor => {
        return processor.validData(emailMessageData)
        .then(valid => {
            if(valid){
                if(processor.requiresAuthentication(emailMessageData) && !senderAuthenticate(emailMessageData)){
                    return Promise.resolve({processor:processor.name, error:"Invalid Sender", emailMessageData:emailMessageData})
                }
                return processor.processMessage(emailMessageData)
                .then(processorResults => {
                    // console.log('processorResults',require('util').inspect(processorResults, { depth: null }));
                    return {processor:processor.name,
                        results:processorResults,
                        from:emailMessageData.header.from,
                        uid: emailMessageData.uid,
                    }
                })
                // .catch(err=> {console.log('processMessage err', err); return err})
            }
            return Promise.resolve({processor:processor.name, emailMessageData:emailMessageData})
        })
        .catch(err=> {
            return Promise.resolve({processor:processor.name, error:err, emailMessageData:emailMessageData})
        })
    }))
}

module.exports.processEmailMessage = processEmailMessage;
module.exports.successEmail = successEmail;

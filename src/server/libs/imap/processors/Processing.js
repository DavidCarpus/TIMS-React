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
    // processors.map( processor => {
    //     return processor.successEmail(emailMessageData)
    // })
    //TODO: Check with each processor to see if success email needed
    // console.log('--------------'); console.trace('TODO: Check with each processor to see if success email needed'); console.log('--------------');;
    // throw new Error('TODO: Check with each processor to see if success email needed' );
    if(emailMessageData.processor === 'MeetingDocument')
        return "Submission Successful"
    else {
        return ''
    }
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

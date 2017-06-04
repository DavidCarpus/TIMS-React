
var validHostOrigins=['carpusconsulting.com', 'miltonnh-us.com']
var validEmailAddresses= ['miltonnh@carpusconsulting.com']

function validateHostOrigins(emailsToValidate) {
    return Promise.all(emailsToValidate.map(email => {
        let envelope = email.header.attributes.envelope;
        if (validHostOrigins.indexOf(envelope.from[0].host) < 0) {
            let errMsg = 'Invalid host sender.';
            email.err = errMsg;
        }
        return Promise.resolve(email);
    })
); //Promise.allS
}
function requiredAttachmentsPresent(email, configuration) {
    // console.log('requiredAttachmentsPresent');
    if (!configuration.imapProcess.emailAttachments.required) { return true;}
    if (! email.attachmentPromises) { return false;}
    if ( email.attachmentPromises.length == 0) { return false;}
}

function hasAllRequiredData(email) {
    let emailData = email.DBData
    let requiredFields = ['groupName', 'date', 'requestType', 'recordtype'];
    return requiredFields.reduce((acc, field) => {
        if(emailData[field] == null)  {
            emailData.error = ( typeof emailData.error != 'undefined'  ) ? emailData.error : ''; // Init string as blank if needed
            emailData.error += field
            return false;
        };
        return acc;
    }, true)
}



module.exports = {
    validateHostOrigins,
    hasAllRequiredData,
    requiredAttachmentsPresent
}
// export default validateHostOrigins;

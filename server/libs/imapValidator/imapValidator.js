var Config = require('../../config'),
configuration = new Config();


var validHostOrigins=['carpusconsulting.com', 'miltonnh-us.com', 'miltonnh.us']
var validEmailAddresses= ['miltonnh@carpusconsulting.com']

if (configuration.mode == 'development') {
    validHostOrigins.push('jovaraanddavid.us');
    validEmailAddresses.push('miltonnh@jovaraanddavid.us');
}

//=======================================
function validateHostOrigins(emailsToValidate) {
    return Promise.all(emailsToValidate.map(email => {
        let envelope = email.header.attributes.envelope;
        if (validHostOrigins.indexOf(envelope.from[0].host) < 0) {
            let errMsg = 'Invalid host sender.';
            email.err = errMsg;
        }
        return Promise.resolve(email);
    })
);
}
//=======================================
function requiredAttachmentsPresent(email, configuration) {
    if (!configuration.imapProcess.emailAttachments.required) { return true;}
    if (! email.attachmentPromises) { return false;}
    if ( email.attachmentPromises.length == 0) { return false;}
    return true;
}
//=======================================
function hasAllRequiredData(email) {
    let emailData = email.DBData
    let requiredFields = ['groupName', 'date', 'requestType', 'recordtype'];
    if (email.DBData.recordtype === 'HelpfulLinks') {
        requiredFields = [ 'date', 'requestType', 'recordtype'];
    }
    return requiredFields.reduce((acc, field) => {
        if(emailData[field] == null)  {
            emailData.error = ( typeof emailData.error != 'undefined'  ) ? emailData.error : ''; // Init string as blank if needed
            emailData.error += field + ','
            return false;
        };
        return acc;
    }, true)
}

//=======================================
module.exports = {
    validateHostOrigins,
    hasAllRequiredData,
    requiredAttachmentsPresent,
    // extractHeaderData,
    // extractDBData
}
//=======================================
//=======================================
//=======================================
if (require.main === module) {
    console.log('called directly');
    // console.log('getGroupNameFromTextLine1:', getGroupNameFromTextLine('bos'));
    console.log('validHostOrigins:' + validHostOrigins);
    console.log('validEmailAddresses:' + validEmailAddresses);
    console.log('configuration:' , configuration);

    process.exit();
}

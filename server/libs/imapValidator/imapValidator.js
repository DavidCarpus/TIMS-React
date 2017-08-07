var Config = require('../../config'),
configuration = new Config();

let cellCarriers = require('../AlertRequests/cellCarriers.json')

var validWebsiteHostOrigins=['carpusconsulting.com', 'miltonnh-us.com', 'miltonnh.us', 'dev.miltonnh.us', 'test.miltonnh.us']
// var validHostOrigins=['carpusconsulting.com', 'miltonnh-us.com', 'miltonnh.us', 'dev.miltonnh.us', 'test.miltonnh.us']
var validEmailAddresses= ['miltonnh@carpusconsulting.com']
var validHostOrigins = validWebsiteHostOrigins.concat(cellCarriers.map(carrier => carrier.email))

if (configuration.mode == 'development') {
    validHostOrigins.push('jovaraanddavid.us');
    validEmailAddresses.push('miltonnh@jovaraanddavid.us');
}
//=======================================
function validateOrigins(emailsToValidate, validOrigins) {
    return Promise.all(emailsToValidate.map(email => {
        let envelope = email.header.attributes.envelope;
        if (validOrigins.indexOf(envelope.from[0].host) < 0) {
            let errMsg = 'Invalid host sender.';
            email.err = errMsg;
        }
        return Promise.resolve(email);
    }));
}
//=======================================
function validateWebEditHostOrigins(emailsToValidate) {
    return validateOrigins(emailsToValidate, validWebsiteHostOrigins )
}

//=======================================
function validateHostOrigins(emailsToValidate) {
    // console.log('validateHostOrigins' + require('util').inspect(validHostOrigins, { depth: null }));
    return validateOrigins(emailsToValidate, validHostOrigins )
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
    if (email.DBData.recordtype === 'HelpfulLinks' || email.DBData.recordtype === 'Menu' || email.DBData.recordtype === 'BoardCommittee') {
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
    validateWebEditHostOrigins,
    // hasAllRequiredData,
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

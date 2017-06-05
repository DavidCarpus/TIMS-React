
var validHostOrigins=['carpusconsulting.com', 'miltonnh-us.com']
var validEmailAddresses= ['miltonnh@carpusconsulting.com']

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
    return requiredFields.reduce((acc, field) => {
        if(emailData[field] == null)  {
            emailData.error = ( typeof emailData.error != 'undefined'  ) ? emailData.error : ''; // Init string as blank if needed
            emailData.error += field
            return false;
        };
        return acc;
    }, true)
}
//=======================================
function extractHeaderData(email) {
    let header = email.header.parts[0].body;
    return {from:header.from,subject:header.subject,to:header.to, date:email.header.attributes.date}
}

//=======================================
function getGroupNameFromTextLine(textLine) {
    const groupNames = ["PUBLICWORKS", "SELECTMEN", "RECREATION"];
    var groupName = groupNames.indexOf(textLine.toUpperCase().split(' ').join('')); // Remove spaces from the line
    console.log("Matched:",groupName);
    if (groupName >= 0) { return groupNames[groupName]; }
    return null;
}
//=======================================
function extractDBData(email) {
    let header = email.header.parts[0].body;
    let bodyData = email.bodyData

    let bodyLines = bodyData.trim().split("\n");
    let results = { mainpage: true, date: new Date(), groupName: 'Main', requestType: 'ADD'};

    bodyLines.map( line=>{
        line = line.toUpperCase().trim();
        results.groupName = getGroupNameFromTextLine(line) || results.groupName || "";

        dte = Date.parse(line);
        if (dte >= 0 ) {
            if(line.indexOf('EXPIRE') >= 0 ) {
                results.expire = dte;
            } else {
                results.date = dte;
            }
        }
        if(line.indexOf('MAINPAGE') >= 0 ) {
            if (line == 'MAINPAGE') {
                results.mainpage = true;
            } else if(line.indexOf('NO') >= 0 ) {
                results.mainpage = false;
            }
        }
        if (line.startsWith('DESC:') || line.startsWith('DESCRIPTION')) {
            results.desc = line;
        }

        if(line.indexOf('AGENDA') >= 0 ) {            results.recordtype = 'Agendas';        }
        if(line == 'NOTICE' ) {            results.recordtype = 'Notice';        }
        if(line == 'UPDATE' ) {            results.requestType = 'UPDATE';        }
    }) // bodyTextPart.map

    // TODO: Determine if header subject contains missing field data
    results.groupName = getGroupNameFromTextLine(header.subject[0]) || results.groupName || "";

    return results;
}
//=======================================
module.exports = {
    validateHostOrigins,
    hasAllRequiredData,
    requiredAttachmentsPresent,
    extractHeaderData,
    extractDBData
}

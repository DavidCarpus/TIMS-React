var processAlertRequest = require('./AlertRequestProcessor').processAlertRequest;
var processMeetingRequest = require('./MeetingProcessor').processData;
var processNoticeRequest = require('./NoticeProcessor').processData;
var processBoardCommitteeRequest = require('./BoardCommitteeProcessor').processData;
var processMenuRequest = require('./MenuProcessor').processData;
var processDocumentRequest = require('./DocumentProcessor').processData;
var processVideoRequest = require('./VideoProcessor').processData;
var processUserUpdateRequest = require('./UserProcessor').processData;
var processPageTextRequest = require('./PageTextProcessor').processData;
var processHelpfulLinkRequest = require('./HelpfulLinksProcessor').processData;

function submit(email, imap, knex) {
    if (typeof email.err != 'undefined') {
        // 'Processors return a Promise.all / array so return array for errors as well'
        return Promise.resolve([email]);
    } else {
    switch (email.DBData.recordtype) {
        case 'Notice':
            return processNoticeRequest(email);
            break;
        case 'RFP':
            return processNoticeRequest(email);
            break;
        case 'Agenda':
        case 'Minutes':
            return processMeetingRequest(email)
            break;
        case 'Document':
            return processDocumentRequest(email);
            break;
        case 'Video':
            return processVideoRequest(email);
            break;
        case 'User':
            return processUserUpdateRequest(email);
            break;
        case 'HelpfulLinks':
            return processHelpfulLinkRequest(email);
            break;
        case 'PageText':
            return processPageTextRequest(email);
            break;
        case 'Menu':
            return processMenuRequest(email);
            break;
        case 'BoardCommittee':
            return processBoardCommitteeRequest(email);
            break;
        case 'AlertRequest':
            return processAlertRequest(email, knex)
            // return alertRequestProcessor.process(email);
            break;


        default:
            console.log('===================');
            console.log('email:',email);
            return Promise.reject('Unknown recordtype:' + email.DBData.recordtype)
    }
    }

}


module.exports.submit = submit;

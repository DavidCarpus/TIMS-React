var NoticeProcessor = require('./NoticeProcessor').NoticeProcessor;
var noticeProcessor = new NoticeProcessor()

var MeetingProcessor = require('./MeetingProcessor').MeetingProcessor;
var meetingProcessor = new MeetingProcessor()

var DocumentProcessor = require('./DocumentProcessor').DocumentProcessor;
var documentProcessor = new DocumentProcessor()

var VideoProcessor = require('./VideoProcessor').VideoProcessor;
var videoProcessor = new VideoProcessor()

var UserProcessor = require('./UserProcessor').UserProcessor;
var userProcessor = new UserProcessor()

var HelpfulLinksProcessor = require('./HelpfulLinksProcessor').HelpfulLinksProcessor;
var helpfulLinksProcessor = new HelpfulLinksProcessor()

var PageTextProcessor = require('./PageTextProcessor').PageTextProcessor;
var pageTextProcessor = new PageTextProcessor()

var MenuProcessor = require('./MenuProcessor').MenuProcessor;
var menuProcessor = new MenuProcessor()

var BoardCommitteeProcessor = require('./BoardCommitteeProcessor').BoardCommitteeProcessor;
var boardCommitteeProcessor = new BoardCommitteeProcessor()

var AlertRequestProcessor = require('./AlertRequestProcessor').AlertRequestProcessor;
var alertRequestProcessor = new AlertRequestProcessor()



function submit(email, imap) {
    if (typeof email.err != 'undefined') {
        // 'Processors return a Promise.all / array so return array for errors as well'
        return Promise.resolve([email]);
    } else {
    switch (email.DBData.recordtype) {
        case 'Notice':
            return noticeProcessor.process(email);
            break;
        case 'RFP':
            return noticeProcessor.process(email);
            break;
        case 'Agendas':
        case 'Minutes':
            return meetingProcessor.process(email);
            break;
        case 'Document':
            return documentProcessor.process(email);
            break;
        case 'Video':
            return videoProcessor.process(email);
            break;
        case 'User':
            return userProcessor.process(email);
            break;
        case 'HelpfulLinks':
            return helpfulLinksProcessor.process(email);
            break;
        case 'PageText':
            return pageTextProcessor.process(email);
            break;
        case 'Menu':
            return menuProcessor.process(email);
            break;
        case 'BoardCommittee':
            return boardCommitteeProcessor.process(email);
            break;
        case 'AlertRequest':
            return alertRequestProcessor.process(email);
            break;


        default:
            console.log('===================');
            console.log('email:',email);
            return Promise.reject('Unknown recordtype:' + email.DBData.recordtype)
    }
    }

}


module.exports.submit = submit;

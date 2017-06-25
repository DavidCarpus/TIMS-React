
const groupNames = require('./GroupNames.json');

//=======================================
function extractHeaderData(email) {
    let header = email.header.parts[0].body;
    return {from:header.from,subject:header.subject,to:header.to, date:email.header.attributes.date}
}

//=======================================
function getGroupNameFromTextLine(textLine) {
    let testLine = textLine.toUpperCase().split(' ').join(''); // Remove spaces from the line
    let foundGroup = groupNames.filter(group => {
        // console.log('group:', group, testLine);
        if (testLine == group.primary.toUpperCase()) {return true;}
        let alternatives = group.alternatives.filter(alternative => {
            if (testLine == alternative.toUpperCase()) {return true;}
        })
        if (alternatives.length > 0) {return true; }
        // console.log('alternatives:', alternatives);
        return false;
    })
    // console.log('foundGroup:', foundGroup);
    return foundGroup.length > 0 ? foundGroup[0].primary: null;
}
//=======================================
function isVideoLink(line) {
    if (line.match('HTTPS?:\/.*YOUTUBE.COM\/.*')) {
        return true;
    }
}
//=======================================
function hasURL(line) {
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    // var expression = HTTPS?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)

    var regex = new RegExp(expression);
    if (line.match(regex)) {
        console.log('Found URL in:', line);
        return true;
    }
}

//=======================================
function extractDBData(email) {
    // console.log('email:' + require('util').inspect(email, { color:true, depth: null }));
    let header = email.header.parts[0].body;
    let bodyData = email.bodyData

    let bodyLines = bodyData.trim().split("\n");
    let results = { mainpage: true, date: new Date(), requestType: 'ADD'};

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
        if (line.startsWith('DESC:')) {                 results.description = line.replace(/DESC\:/i,'').trim();        }
        if (line.startsWith('DESCRIPTION')) {    results.description = line.replace(/DESCRIPTION/i,'').trim();        }

        if(line.indexOf('AGENDA') >= 0 ) {            results.recordtype = 'Agendas';        }
        if(line.indexOf('MINUTES') >= 0 ) {            results.recordtype = 'Minutes';        }
        if(line.indexOf('DOCUMENT') >= 0 ) {            results.recordtype = 'Document';        }
        if(line.indexOf('HELPFULLINK') >= 0 ) {            results.recordtype = 'HelpfulLinks';        }
        if(line.indexOf('HELPFUL LINK') >= 0 ) {            results.recordtype = 'HelpfulLinks';        }
        if(line == 'NOTICE' ) {            results.recordtype = 'Notice';        }
        if(line == 'USER' ) {            results.recordtype = 'User';        }
        if (isVideoLink(line)) {            results.recordtype = 'Video';        }

        if (hasURL(line)) {            results.URL = line;        }

        if(line.indexOf('TERM:') >= 0 ) {            results.term = line.replace('TERM:','').trim();        }
        if(line.indexOf('OFFICE:') >= 0 ) {            results.office = line.replace('OFFICE:','').trim();        }
        if(line.indexOf('PHONE:') >= 0 ) {            results.phone = line.replace('PHONE:','').trim();        }
        if(line.indexOf('EMAIL:') >= 0 ) {            results.email = line.replace('EMAIL:','').trim();        }

        if(line == 'UPDATE' ) {            results.requestType = 'UPDATE';        }
        if(line == 'REMOVE' ) {            results.requestType = 'REMOVE';        }
    }) // bodyTextPart.map

    // TODO: Determine if header subject contains missing field data
    // console.log('header.subject:' + require('util').inspect(header.subject, { depth: null }));
    if(header.subject[0].toUpperCase().indexOf('HELPFUL LINK') >= 0 ) {            results.recordtype = 'HelpfulLinks';        }
    if(header.subject[0].toUpperCase().indexOf('HELPFULLINK') >= 0 ) {            results.recordtype = 'HelpfulLinks';        }

    results.groupName = getGroupNameFromTextLine(header.subject[0]) || results.groupName || "";
    if (results.groupName == '') { delete results.groupName; }

    return results;
}
//=====================================
module.exports = {
    extractHeaderData,
    extractDBData,
    getGroupNameFromTextLine
}

//=====================================
//=====================================
let testEmail = { header:
   { attributes:
      { envelope:
         { date: '2017-06-06T21:16:51.000Z',
           subject: 'PlanningBoard',
           from: [ { name: null, mailbox: 'miltonnh', host: 'jovaraanddavid.us' } ],
           sender: [ { name: null, mailbox: 'miltonnh', host: 'jovaraanddavid.us' } ],
           replyTo: [ { name: null, mailbox: 'miltonnh', host: 'jovaraanddavid.us' } ],
           to:
            [ { name: 'miltonnh',
                mailbox: 'miltonnh',
                host: 'jovaraanddavid.us' } ],
           cc: null,
           bcc: null,
           inReplyTo: null,
           messageId: '<20170606171651.Horde.30ayGKJPOGpQEyDDXwymTdC@jovaraanddavid.us>' },
        date: '2017-06-06T21:16:52.000Z',
        flags: [],
        uid: 111,
        modseq: '564' },
     parts:
      [ { which: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
          size: 142,
          body:
           { date: [ 'Tue, 06 Jun 2017 17:16:51 -0400' ],
             from: [ 'miltonnh@jovaraanddavid.us' ],
             to: [ 'miltonnh <miltonnh@jovaraanddavid.us>' ],
             subject: [ 'PlanningBoard' ] } } ],
     seqNo: 1 },
  attachmentPromises: [],
  uid: 111,
  bodyData: '\r\nuser\r\nremove\r\nname: Tom Gray\r\n\r\n' };




//=====================================
if (require.main === module) {
    console.log('called directly');
    console.log('testEmail:' + require('util').inspect(extractDBData(testEmail), { depth: null }));
    process.exit();
}

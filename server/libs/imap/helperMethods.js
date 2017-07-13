
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
        // console.log('Found URL in:', line);
        return true;
    }
}


//=======================================
function getRecordTypeFromLine(line) {
    let recordTypes = [
        {recordType: 'Agendas', searchMatches: ['AGENDA'] },
        {recordType: 'Minutes', searchMatches: ['MINUTES'] },
        {recordType: 'Notice', searchMatches: ['^NOTICE$'] },
        {recordType: 'Document', searchMatches: ['DOCUMENT'] },
        {recordType: 'HelpfulLinks', searchMatches: ['HELPFULLINK', 'HELPFUL LINK'] },
        {recordType: 'PageText', searchMatches: ['PAGETEXT'] },
        {recordType: 'Menu', searchMatches: ['MENU ADD:?', 'ADD MENU:?','MENU DELETE:?', 'DELETE MENU:?'] },
        {recordType: 'User', searchMatches: ['USER ADD:?', 'ADD USER:?','USER DELETE:?', 'DELETE USER:?'] },
        {recordType: 'BoardCommittee', searchMatches: ['BOARD ADD:?', 'ADD BOARD:?','BOARD DELETE:?', 'DELETE BOARD:?'] },
        ]

    ucaseLine = line.toUpperCase().trim();
    if (isVideoLink(ucaseLine)) { return 'Video';}

    let matches = recordTypes.filter(type => {
        return  (type.recordType === ucaseLine) || type.searchMatches.reduce(function(sum, value) {
            return sum || (ucaseLine.search(new RegExp(value, 'i')) >= 0);
        }, false);
    })
    if (matches.length > 0) {
        return matches[0].recordType
    } else {
        return null;
    }
}
//=======================================
function getRequestTypeFromLine(line) {
    let requestTypes = [
        {requestType: 'ADD', searchMatches: [
            '^ADD$',
            'MENU ADD:?','ADD MENU:?','USER ADD:?','ADD USER:?','BOARD ADD:?','ADD BOARD:?',] },
        {requestType: 'REMOVE', searchMatches:[
            '^REMOVE$','^DELETE$',
            'MENU REMOVE:?','REMOVE MENU:?','USER REMOVE:?','REMOVE USER:?','BOARD REMOVE:?','REMOVE BOARD:?',
            'MENU DELETE:?','DELETE MENU:?','USER DELETE:?','DELETE USER:?','BOARD DELETE:?','DELETE BOARD:?',
            ] },
        {requestType: 'UPDATE', searchMatches: ['^UPDATE$'] },
        {requestType: 'REQUEST', searchMatches: ['^REQUEST$'] },
        ]
        ucaseLine = line.toUpperCase().trim();

        let matches = requestTypes.filter(type => {
            return  (type.requestType === ucaseLine) || type.searchMatches.reduce(function(sum, value) {
                return sum || (ucaseLine.search(new RegExp(value, 'i')) >= 0);
            }, false);
        })
        if (matches.length > 0) {
            return matches[0].requestType
        } else {
            return null;
        }
}
//=======================================
function extractDBData(email) {
    // console.log('email:' + require('util').inspect(email, { color:true, depth: null }));
    let header = email.header.parts[0].body;
    let bodyData = email.bodyData
    let emailSubject = header.subject[0].toUpperCase();

    let bodyLines = bodyData.trim().split("\n");
    let results = { mainpage: true, date: new Date(), requestType: 'ADD'};

    bodyLines.map( line=>{
        let originalLine = line;
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
        let recordtype = getRecordTypeFromLine(originalLine);
        if (recordtype != null ) {results.recordtype=recordtype}

        let requestType = getRequestTypeFromLine(originalLine);
        if (requestType != null ) {results.requestType=requestType}

        if (hasURL(line)) {            results.URL = line;        }


        let trimMatches = [
            {fieldName: 'description', searchMatches: [ '^DESC:','^DESCRIPTION:'] },
            {fieldName: 'term', searchMatches: [ '^TERM:'] },
            {fieldName: 'office', searchMatches: [ '^OFFICE:']},
            {fieldName: 'phone', searchMatches: [ '^PHONE:']},
            {fieldName: 'email', searchMatches: [ '^EMAIL:']},
            {fieldName: 'menu', searchMatches: [ '^MENU ADD:', '^ADD MENU:',  '^BOARD ADD:', '^ADD BOARD:']},
            {fieldName: 'name', searchMatches: [ '^USER ADD:', '^ADD USER:', '^USER DELETE:', '^DELETE USER:']},
        ]
        let matches = trimMatches.filter(type => {
            return  (type.fieldName === line) || type.searchMatches.reduce(function(sum, value) {
                return sum || (line.search(new RegExp(value, 'i')) >= 0);
            }, false);
        })
        if (matches.length > 0) {
            results[matches[0].fieldName] = originalLine.replace(/.*\:/i,'').trim();
        }

    }) // bodyTextPart.map

    // TODO: Determine if header subject contains missing field data
    recordtype = getRecordTypeFromLine(emailSubject);
    if (recordtype != null ) {results.recordtype=recordtype}

    requestType = getRequestTypeFromLine(emailSubject);
    if (requestType != null ) {results.requestType=requestType}

    if(emailSubject.startsWith('RE:') >= 0 ) {
        // console.log('subject indicates PageText update');
        emailSubject = header.subject[0]; // We need the 'original'/before uppercase
        let subjectParts = emailSubject.replace('Re:','').trim().split("-");
        if (subjectParts.length === 2) {
            results.groupName = subjectParts[0].trim()
            results.section = subjectParts[1].trim()
            results.recordtype = 'PageText';
            results.requestType = 'UPDATE';
            results.bodyData = bodyData;
            // console.log('*********PageText:', results);
        }
    }

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

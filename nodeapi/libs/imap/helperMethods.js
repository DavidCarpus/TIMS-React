
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
function isVideoLink(line) {
    if (line.match('HTTPS?:\/.*YOUTUBE.COM\/.*')) {
        return true;
    }
}

//=======================================
function extractDBData(email) {
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
        if (line.startsWith('DESC:') || line.startsWith('DESCRIPTION')) {
            results.desc = line;
        }

        if(line.indexOf('AGENDA') >= 0 ) {            results.recordtype = 'Agendas';        }
        if(line.indexOf('MINUTES') >= 0 ) {            results.recordtype = 'Minutes';        }
        if(line.indexOf('DOCUMENT') >= 0 ) {            results.recordtype = 'Document';        }
        if (isVideoLink(line)) {            results.recordtype = 'Video';        }
        if(line == 'NOTICE' ) {            results.recordtype = 'Notice';        }
        if(line == 'UPDATE' ) {            results.requestType = 'UPDATE';        }
    }) // bodyTextPart.map

    // TODO: Determine if header subject contains missing field data
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

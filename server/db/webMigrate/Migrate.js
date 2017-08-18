var fs = require('fs');
const cheerio = require('cheerio')
var Config = require('../../config'),
configuration = new Config();

var knexConfig = require('../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

var pullLocalCopies = require('./serverIO').pullLocalCopies;
var pullNewServerDirs = require('./serverIO').pullNewServerDirs;
var pushFileToServer = require('./serverIO').pushFileToServer;
var fetchURL = require('./serverIO').fetchURL;
var getServerFilePath = require('./serverIO').getServerFilePath;
var getSourceServerHost = require('./serverIO').getSourceServerHost;

let logErrors = true
// let logErrors = false

let MIN_VALID_YEAR = 2007

const meetingPaths = require('./TablesToScrape.json');
// const meetingPaths = require('./TablesToScrapeTest.json');

//========================================
let validRecordType = (recordtype) => ["Agenda", "Minutes", "Video"].includes(recordtype)
let isMailToLink = (uri) => uri.toLowerCase().startsWith('mailto')
let ignoreMailToLink = (record) => !isMailToLink(record.uri)
let onlyLocalDoc = (record) => ['Notice', 'HelpfulInformation', 'Document','Newsletter'].includes(record.recordtype) &&
    (!record.remotePath.startsWith('http') ||
    (record.remotePath.startsWith('http') && !record.remotePath.indexOf(getSourceServerHost() !== -1)))
let isPhysicalFile  = (rec)  => (rec.recordtype === 'Video' ? false: true)

let ignoreExternalLinks = (record) => record.uri.indexOf(getSourceServerHost() !== -1)
//========================================
function translateRecordType(recordtype) {
    let translated = [
        {orig:'AGENDA', valid:'Agenda'},
        {orig:'MINUTES', valid:'Minutes'},
        {orig:'Mnutes', valid:'Minutes'},
        {orig:'Mintues', valid:'Minutes'},
        {orig:'MInutes', valid:'Minutes'},
        {orig:'VIDEO', valid:'Video'},
        {orig:'video', valid:'Video'},
    ].filter(opt => opt.orig===recordtype)
    if (translated && translated.length > 0 && typeof translated !== 'undefined') {
        return translated[0].valid
    // } else {
    //     console.log('Unable to translate document:' , recordtype);
    }
    // if (typeof recordtype === 'undefined') { return ''}
    return recordtype
}
//========================================
//========================================
function newFilenameFromRecord(rec) {
    let oldKey = ''
    let parseOldFN = rec.uri.replace(/.*\//, '').match(/.*_(\d*)_.*/)
    if (parseOldFN && parseOldFN.length > 1) {
        oldKey = parseOldFN[1]
    }
     let extension = rec.uri.match(/\.[0-9a-z]+$/i, '')[0]
    return  rec.groupName + '_' + getY_M_D(rec.date) + '_' + rec.label.replace(' ', '') +'_'+oldKey + extension
}
//========================================
let onlyUnique = (value, index, self) => self.indexOf(value) === index;
let getY_M_D = (date) =>  date.getUTCFullYear() + "_" + (date.getUTCMonth()<9?'0':'') + (date.getUTCMonth()+1) +  "_" + (date.getUTCDate()<10?'0':'') + (date.getUTCDate());
let getRecordYear = (rec) => rec.date.getUTCFullYear()

//========================================
function extractMeetingTableRows(originalHTML, groupName) {
    let data = originalHTML;
    data = data.replace(/<\/tr>.*/g, '')
    let anchorRegEx = /<a .*?\"(\S*?)\".*?>(.*?)</;

    return data.split('<tr>').map(row => {
        let cells = row.split('\n')
        .map(cell => cell.trim())
        .filter( r => r.startsWith('<td')) // Ignore items that are NOT wrapped in a TD
        .filter( r => r !== '<td>&#xA0;</td>')
        .map(tagCell => tagCell
            .replace(/<\/?td.*?>/g, '')
            .replace(/<\/?tbody>/g, '')  //Strip out TD and tbody tags
            .replace(/&#xA0;/g, '')
        ).map(cellToReformat => {
            cellToReformat = cellToReformat.replace(/<\/?span.*?>/g, '')
            cellToReformat = cellToReformat.replace(/<\/?strong.*?>/g, '')

            if (cellToReformat.startsWith('<a')) {
                var match = anchorRegEx.exec(cellToReformat);
                return  { label: match[2].trim(), uri: match[1]}
            } else { // SHOULD be the first cell and a date
                return {dateStr: cellToReformat, date:new Date(cellToReformat), groupName:groupName}
            }
        })
        if (! cells[0] && cells.length > 0 ) {
            logErrors && console.error( row.replace(/<td>&#xA0;<\/td>/g, '').trim()   )
        }
        return cells
    })
}
//========================================
function dbRecordsFromExtractedRow(rowData) {
    let dateElement = rowData[0]
    if (!dateElement || typeof dateElement === undefined) {
        console.log("Missing date element???", rowData);
        return
    }
    let meetingDate = dateElement.date
    let groupName = dateElement.groupName

    if (isNaN(meetingDate.getTime() )) {
        if (dateElement.dateStr.search(/^<strong>....<\/strong>$/) >= 0 ) {
            return
        }
        logErrors && console.error("Invalid date:", dateElement.dateStr);
        return
    }
    if (meetingDate.getUTCFullYear() > (new Date()).getUTCFullYear()+1 ||
        meetingDate.getUTCFullYear() < MIN_VALID_YEAR ) {
            logErrors && console.error("Invalid date:", dateElement.dateStr);
        return
    }
    // if (! validRecordType()) {
    //     logErrors && console.error("Invalid date:", dateElement.dateStr);
    // }

    return rowData.filter(cell => cell.uri).map(doc => {
        // console.log(dateElement.dateStr + ' document:', doc);
        let uri = doc.uri
        if (! uri.startsWith('http')) {
            uri = 'http://' + getSourceServerHost() + uri
        }
        let label = doc.label
        if (! validRecordType(label) ) {
            label = translateRecordType(doc.label)
        }
        // if (! validRecordType(label) ) {
        //     console.log('label still not valid?', label);
        // }

        return {groupName:groupName, date: meetingDate,  label:label, uri:uri, recordtype:label}
    })
}
//========================================
//========================================
function enterIntoDB(record) {
    // Check DB for record and add if not there
    let checkRecord={}
    Object.assign(checkRecord, record)
    delete checkRecord.date
    // console.log('sql ', knex('PublicRecords').select('*').where(checkRecord).toString());
    return knex('PublicRecords').select('*').where(checkRecord)
    .then(results => {
        if (results.length === 0) {
            return knex('PublicRecords').insert(record)
            // .then(results => {
            //     logErrors && console.log("Log to DB:" , record.recordtype, record.pageLink, record.recorddesc);
            // })
        }
        return null
    })
    .then(results => {
        if (results && results.length > 0) {
            record.id = results[0];
        }
        return Promise.resolve([record]);
    })
    .catch(dberr => {
        console.log("DBError:", dberr);
        return Promise.reject(dberr);
    })
}
//========================================
//========================================
function cloneMeetings(paths) {
    // console.log('cloneMeetings');
    return Promise.all(paths.map(record => {
        console.log('Meetings -',record.group);
        return fetchURL(record.url)
        .then(wholePage => {
            var $ = cheerio.load(wholePage);
            return $(record.query).html();
        })
        .then( onlyTable => extractMeetingTableRows(onlyTable, record.group) )
        .then(extractedRows => {
            let allRecords=[];
            extractedRows.map((extractedRow, index) => {
                if (extractedRow.length > 0 ) {
                    let dbRecords = dbRecordsFromExtractedRow(extractedRow)
                    Array.prototype.push.apply(allRecords, dbRecords);
                }
            })
            // return allRecords.filter(rec => rec.date.getUTCFullYear() === 2012)
            allRecords.filter(rec=>! validRecordType(rec.label)).map(rec => {
                logErrors && console.error(rec.groupName , "Invalid document type:", getY_M_D(rec.date) , '"'+rec.label+'"');
                // console.log(rec);
            })

            return allRecords.filter(rec =>validRecordType(rec.label)  )
        })
        .then( pullLocalCopies)
        .then(pulledLocal => {
            return pulledLocal.map(rec => {
                if (isPhysicalFile(rec)) {
                    rec.newFilename = newFilenameFromRecord(rec)
                }
                return rec
            })
        })
        .then(recWithDest => {
            // Fetch directories (by year) from new server
            return pullNewServerDirs(getServerFilePath(), recWithDest.map(getRecordYear ).filter(onlyUnique) )
            .then( serverDirs => {
                let allPaths=[];
                serverDirs.map( directory => {
                    directory.map( path => {
                        allPaths.push(path)
                    })
                    return recWithDest
                })
                // console.log('serverDirs:', allPaths.sort( (a,b) => a.localeCompare(b)));
                let notOnServer = (rec) => !allPaths.includes(rec.date.getUTCFullYear() + '/' +rec.newFilename)

                // Check converted records against server directories
                return Promise.all(
                    recWithDest.filter(notOnServer).filter(isPhysicalFile).map(rec => {
                        let dest = getServerFilePath() + rec.date.getUTCFullYear() + '/' + rec.newFilename
                        return pushFileToServer(rec.local, dest)
                        .then( (pushReq)=> {
                            return rec
                        })
                        .catch(err => console.log(err))
                    })
                )
                .then( newFilesUploaded => {
                    return recWithDest;
                })
            })
        })
        .then(filesCopied => {
            // Log to database if not already there
            let fileLink = (record) => isPhysicalFile(record)
                ? record.date.getUTCFullYear() + '/' + record.newFilename
                : record.uri;
            return Promise.all(
                filesCopied.map(rec => {
                    let dbEntry = {pageLink:rec.groupName, recordtype: rec.label, date:rec.date, fileLink:fileLink(rec)}
                    return enterIntoDB(dbEntry)
                })
            )
        })

    }))

}
//========================================
function extractLinksFromTable(tableHTML) {
    var linkRegEx = /(<a.*?<\/a.*?>)/g
    var links=[];
    let defaultRecordtype = 'Document'

    if (tableHTML.indexOf('width:164px') !== -1) {
        return links;
    }

    if (tableHTML.toUpperCase().indexOf('Helpful Information'.toUpperCase()) >= 0) {
        defaultRecordtype = 'HelpfulInformation'
    }
    if (tableHTML.toUpperCase().indexOf('Notices'.toUpperCase()) >= 0) {
        defaultRecordtype = 'Notice'
    }
    if (tableHTML.toUpperCase().indexOf('Gazette'.toUpperCase()) >= 0) {
        defaultRecordtype = 'Newsletter'
    }
    while ((match = linkRegEx.exec(tableHTML)) !== null) {
        let recordtype = defaultRecordtype

        var link =  match[0]
        let uri=link.match(/"(.*?)"/)[0]
        .replace(/"/g,"")
        .trim()

        let desc=link.match(/>?(.*)/)[0]
        .replace(/<\/?span.*?>/ig,"")
        .replace(/<\/?font.*?>/ig,"")
        .replace(/<\/?strong.*?>/ig,"")
        .replace(/<\/?a.*?>/ig,"")
        .replace(/&amp;/g, '&')
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&#39;/g, "'")
        .trim()

        let sourceHostURI = (uri) => uri.toUpperCase().indexOf(getSourceServerHost().toUpperCase()) == -1
        if (uri.toUpperCase().indexOf('HTTP') >= 0 && sourceHostURI(uri)){
            recordtype = 'HelpfulInformation'
        }
        if (uri.toUpperCase().indexOf('MAILTO') >= 0) {
            recordtype = 'MailTo'
        }
        if (uri.toUpperCase().indexOf('.PHP') >= 0) {
            recordtype = 'Redirect'
        }


        uri = uri.replace(new RegExp('https?://'+getSourceServerHost() ), '')
        let remotePath = uri
        if(['Notice', 'HelpfulInformation','Document', 'Newsletter'].includes(recordtype)){
            if (uri.startsWith('/') ) {
                let origURI = uri
                remotePath = uri.replace(/^\//, '')
                uri = 'http://' + getSourceServerHost() + uri
            }
        }
        links.push({uri:uri, desc:desc, remotePath:remotePath, recordtype:recordtype })
    }

    return links
}
//========================================
function getTablesFromPage(pageHTML, query) {
    var myRe =   /(<table.*[\s\S]*?>[\s\S]*?<\/table)/g
    var tables=[];
    while ((match = myRe.exec(pageHTML)) !== null) {
        if (match[0].toUpperCase().indexOf(query.toUpperCase()) !== -1) {
            tables.push( match[0])
        }
    }
    return tables
}
//========================================
function cloneDocuments(paths) {
    let mergeArrays = (arrays) => [].concat.apply([], arrays)

    return Promise.all(paths.map(record => {
        console.log('Documents -', record.group);
        return fetchURL(record.url)
        .then(wholePage => {
            var $ = cheerio.load(wholePage);
            return getTablesFromPage(wholePage, record.query)
        })
        .then(tablesHTML =>  tablesHTML.map(table =>  extractLinksFromTable(table, record.group) ) )
        .then(tableLinks => mergeArrays(tableLinks) )
        .then( allLinks => {
            return pullLocalCopies(allLinks.filter(rec=>rec.recordtype!=='Redirect'))
            .then(pulledFiles => {
                return allLinks
            })
        } )
        .then(mergedTableLinks => {
            let localFileURL = (rec) => 'Documents/' + rec.remotePath.replace(/uploads\//, '').replace(/.*\//,'')

            return pullNewServerDirs(getServerFilePath(), ['Documents'] )
            .then( serverDirs => {
                let allPaths= mergeArrays(serverDirs)
                mergedTableLinks = mergedTableLinks.map(rec => {
                    rec.targetPath = targetPath = getServerFilePath()+ localFileURL(rec)
                    return rec
                })
                //  console.log('mergedTableLinks', mergedTableLinks);

                let notOnServer = (rec) => !allPaths.includes(localFileURL(rec))

                return Promise.all(
                    mergedTableLinks.filter(onlyLocalDoc).filter(notOnServer).map(rec => {
                        // console.log('Push ', rec.local , 'to', rec.targetPath);
                        return pushFileToServer(rec.local, rec.targetPath)
                        .then( (pushReq)=> {
                            return rec
                        }).catch(err => console.log(err))
                    })
                )
                .then(copiedFilesNeeded => mergedTableLinks )
            })
            .then (toLogToDB => {
                let localFileURL = (rec) => rec.remotePath.indexOf('http') !== -1 ? rec.remotePath: 'Documents/' + rec.remotePath.replace(/uploads\//, '')
                let notEB2Gov = (rec) =>  rec.remotePath.toUpperCase().indexOf('EB2GOV') === -1
                let notnhtaxkiosk = (rec) =>  rec.remotePath.toUpperCase().indexOf('NHTAXKIOSK') === -1

                return Promise.all(
                toLogToDB
                .filter(ignoreMailToLink)
                .filter(notEB2Gov)
                .filter(notnhtaxkiosk)
                .map(rec => {
                    let dbEntry = {pageLink:record.group, recordtype: rec.recordtype ,recorddesc: rec.desc, date:new Date(), fileLink:localFileURL(rec)}
                    // console.log('lnk', dbEntry);
                    return enterIntoDB(dbEntry)
                })
                )
            })

        })
    }))
}
//========================================
//========================================
if (require.main === module) {
    process.on('warning', e => console.warn(e.stack));
    process.setMaxListeners(0);
    let documentPaths = [
        {"group":"Assessing", "url":"http://miltonnh-us.com/assessing.php", "query":"Blind Exemption"},
        {"group":"Assessing", "url":"http://miltonnh-us.com/assessing.php", "query":"2009 Assessment"},
        {"group":"CodeEnforcement", "url":"http://miltonnh-us.com/code.php", "query":"Helpful Information"},
        {"group":"CodeEnforcement", "url":"http://miltonnh-us.com/code.php", "query":"Permits"},
        {"group":"ParksRecreation", "url":"http://miltonnh-us.com/parks.php", "query":"Softball FIeld Renovation Committee Information"},
        {"group":"ParksRecreation", "url":"http://miltonnh-us.com/parks.php", "query":"Arts in the Park"},
        {"group":"TownClerk", "url":"http://miltonnh-us.com/taxes.php", "query":"Notices"},
        {"group":"TownClerk", "url":"http://miltonnh-us.com/taxes.php", "query":"Voting and Election Information"},
        {"group":"TownClerk", "url":"http://miltonnh-us.com/taxes.php", "query":"Additional Links and Information"},
        {"group":"PlanningBoard", "url":"http://miltonnh-us.com/planning_board.php", "query":"Capital Improvement"},
        {"group":"CemeteryTrustees", "url":"http://miltonnh-us.com/cemetery.php", "query":"Right to Inter"},
        {"group":"EconomicDevelopment", "url":"http://miltonnh-us.com/economic.php", "query":"visitnh"},
        {"group":"EconomicDevelopment", "url":"http://miltonnh-us.com/economic.php", "query":"Community FAQ"},
        {"group":"EconomicDevelopment", "url":"http://miltonnh-us.com/economic.php", "query":"UNH"},
        {"group":"Zoning", "url":"http://miltonnh-us.com/zba.php", "query":"Equitable Waiver"},

    ]

    // {"group":"Selectmen", "url":"http://miltonnh-us.com/bos_agendas.php", "query":"table[border='1'][width='95%']"},
    // cloneMeetings(paths)

    logErrors = false
    // cloneDocuments(documentPaths)
    // cloneDocuments([{"group":"Assessing", "url":"http://miltonnh-us.com/assessing.php", "query":"2009 Assessment"},])
    cloneMeetings(meetingPaths)
    .then(meetingsDone => {
        return cloneDocuments(documentPaths)
    })
    .then(done => {
        // setTimeout(() => process.exit(), 5000);
        process.exit()
    })
}
// TODO: Do Cemetery documents via old way (json file in server/db/json)
// {"group":"Cemetery", "url":"http://miltonnh-us.com/cemetery.php", "query":"table[border='1'][style='width: 500px;']"},

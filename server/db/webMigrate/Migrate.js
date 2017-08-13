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
var initSFTP = require('./serverIO').initSFTP;
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
function isPhysicalFile(rec) {
    if (rec.recordtype === 'Video') { return false}
    return true
}
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

let conLogIfField = (obj, fieldName,lbl='rec') => obj[fieldName] && console.log(lbl+'.'+fieldName+':', obj);
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
        console.log(record.group);
        if (configuration.mode !== 'development') {
            initSFTP()
        }
        return fetchURL(record.url)
        .then(wholePage => {
            var $ = cheerio.load(wholePage);
            return $(record.query).html();
        })
        // .then( onlyTable => {
        //     console.log('onlyTable:', onlyTable);
        //     return onlyTable
        // })
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
                logErrors && console.error("Invalid document type:", getY_M_D(rec.date) , '"'+rec.label+'"');
            })
            // console.log('allRecords:', allRecords);
            // allRecords.filter(rec=>rec.recordtype === 'Video').map(rec => {
            //     console.error('+++' +rec.recordtype + ":", getY_M_D(rec.date) , '"'+rec.label+'"');
            // })

            return allRecords.filter(rec =>validRecordType(rec.label)  )
        })
        .then( pullLocalCopies)
        .then(pulledLocal => {
            // console.log('pulledLocal', pulledLocal.length);
            pulledLocal.filter(isPhysicalFile).map(rec => {
                rec.newFilename = newFilenameFromRecord(rec)
            })
            return pulledLocal
        })
        .then(recWithDest => {
            // Fetch directories (by year) from new server
            return pullNewServerDirs(getServerFilePath(), recWithDest.map(getRecordYear ).filter(onlyUnique) )
            .then( serverDirs => {
                // let allPaths= [].concat.apply([], serverDirs)
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
                        }).catch(err => console.log(err))
                    })
                )
                .then( newFilesUploaded => {
                    return recWithDest;
                })
            })
        })
        .then(filesCopied => {
            // Log to database if not already there
            return Promise.all(
                filesCopied.map(rec => {
                    let dest = rec.date.getUTCFullYear() + '/' + rec.newFilename
                    if (!isPhysicalFile(rec)) {
                        dest = rec.uri
                    }
                    let dbEntry = {pageLink:rec.groupName, recordtype: rec.label, date:rec.date, fileLink:dest}
                    return enterIntoDB(dbEntry)
                    // return enterIntoDB({pageLink:rec.groupName, recordtype: rec.label, date:rec.date, fileLink:dest})
                })
            ).then(entered => {
                return entered
            })
        })
    }))

}
//========================================
function extractLinksFromTable(tableHTML) {
    var myRe = /(<a.*?<\/a.*?>)/g
    var links=[];
    let defaultRecordtype = 'Document'

    if (tableHTML.indexOf('width:164px') !== -1) {
        // console.log('***tableHTML', tableHTML);
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
    while ((match = myRe.exec(tableHTML)) !== null) {
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
        .trim()

        if (uri.toUpperCase().indexOf('HTTP') >= 0 && uri.toUpperCase().indexOf(getSourceServerHost().toUpperCase()) == -1 ) {
            // console.log('HelpfulInformation: ', uri);
            recordtype = 'HelpfulInformation'
        }
        if (uri.toUpperCase().indexOf('MAILTO') >= 0) {
            recordtype = 'MailTo'
        }
        if (uri.toUpperCase().indexOf('.PHP') >= 0) {
            console.log('Redirect: ', uri);
            recordtype = 'Redirect'
        }


        uri = uri.replace(new RegExp('https?://'+getSourceServerHost() ), '')
        let remotePath = uri
        if(['Notice', 'HelpfulInformation','Document', 'Newsletter'].includes(recordtype)){
            if (uri.startsWith('/') ) {
                let origURI = uri
                remotePath = uri.replace(/^\//, '')
                uri = 'http://' + getSourceServerHost() + uri
                // console.log('URI from ', origURI, 'to', uri );
                // console.log('remotePath:', remotePath);
            // } else {
            //     console.log('*** ', uri);
            }
        }
        links.push({uri:uri, desc:desc, remotePath:remotePath, recordtype:recordtype })
    }

    return links
}
//========================================
function extractDocumentTableRows(tableHTML) {
    let links = extractLinksFromTable(tableHTML)
    // console.log('Links:', links);
    return links;
}
//========================================
function getTablesFromPage(pageHTML, query) {
    // var myRe = /(<table border[\s\S]*?>[\s\S]*?<\/table)/ig
    var myRe =   /(<table.*[\s\S]*?>[\s\S]*?<\/table)/g
    var tables=[];
    while ((match = myRe.exec(pageHTML)) !== null) {
        // console.log('Check', query);
        if (match[0].toUpperCase().indexOf(query.toUpperCase()) !== -1) {
            // console.log('Matched Check', query, match[0]);
            tables.push( match[0])
        }
    }
    return tables
}
//========================================
function cloneDocuments(paths) {
    return Promise.all(paths.map(record => {
        console.log(record.group);
        if (configuration.mode !== 'development') {
            initSFTP()
        }
        return fetchURL(record.url)
        .then(wholePage => {
            var $ = cheerio.load(wholePage);
            tables = getTablesFromPage(wholePage, record.query)
            return tables
        })
        .then(tablesHTML => {
            return tablesHTML.map(table => {
                // console.log('***tablesHTML', table);
                let rows = extractDocumentTableRows(table, record.group)
                // console.log('Rows:', rows);
                return rows
            })
        })
        .then(tableLinks => {
            // console.log('tableLinks',tableLinks);
            let allLinks= [].concat.apply([], tableLinks)
            // console.log('allLinks',allLinks);
            return allLinks
        })
        .then( allLinks => {
            // console.log('allLinks', allLinks);
            return pullLocalCopies(allLinks.filter(rec=>rec.recordtype!=='Redirect'))
            .then(pulledFiles => {
                // console.log('pulledFiles', pulledFiles);
                return allLinks
            })
        } )
        .then(mergedTableLinks => {
            // console.log('mergedTableLinks', mergedTableLinks);
            let localFileURL = (rec) => 'Documents/' + rec.remotePath.replace(/uploads\//, '').replace(/.*\//,'')

            return pullNewServerDirs(getServerFilePath(), ['Documents'] )
            .then( serverDirs => {
                // console.log('serverDirs', serverDirs);
                let allPaths= [].concat.apply([], serverDirs)
                mergedTableLinks = mergedTableLinks.map(rec => {
                    rec.targetPath = targetPath = getServerFilePath()+ localFileURL(rec)
                    return rec
                })
                //  console.log('mergedTableLinks', mergedTableLinks);
        // uri = uri.replace('/images//stories/downloads'

                let notOnServer = (rec) => !allPaths.includes(localFileURL(rec))
                // let recordsToCopy = mergedTableLinks.filter(ignoreMailToLink).filter(notOnServer)
                let recordsToCopy = mergedTableLinks.filter(onlyLocalDoc).filter(notOnServer)
                // mergedTableLinks.filter(onlyLocalDoc).map(lnk => {
                //     console.log('---', lnk.remotePath, lnk.uri);
                // })
                // console.log('recordsToCopy', mergedTableLinks.filter(record=>record.recordtype==='HelpfulInformation' &&(record.remotePath.startsWith('http') ))
                    // (record.remotePath.startsWith('http') && !record.remotePath.indexOf(getSourceServerHost() !== -1)
                // .filter(onlyLocalDoc)
                // );

                return Promise.all(
                    recordsToCopy.map(rec => {
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
                // let notEB2Gov = (rec) =>  rec.remotePath.toUpperCase().indexOf('EB2GOV') === -1
                logErrors = true

                // toLogToDB.map(lnk => {
                //     console.log('+++', lnk.remotePath, lnk.uri);
                // })

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
    paths = [
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

    // cloneDocuments(paths)
    cloneMeetings(meetingPaths)
    .then(meetingsDone => {
        return cloneDocuments(paths)
    })
    .then(done => {
        // setTimeout(() => process.exit(), 5000);
        process.exit()
    })
}
// TODO: Do Cemetery documents via old way (json file in server/db/json)
// {"group":"Cemetery", "url":"http://miltonnh-us.com/cemetery.php", "query":"table[border='1'][style='width: 500px;']"},

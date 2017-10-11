var fs = require('fs');
const cheerio = require('cheerio')
var Config = require('../../config'),
configuration = new Config();
var addDays = require('date-fns/add_days')

var knexConfig = require('../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

var pullLocalCopies = require('./serverIO').pullLocalCopies;
var pullNewServerDirs = require('./serverIO').pullNewServerDirs;
var pushFileToServer = require('./serverIO').pushFileToServer;
var fetchURL = require('./serverIO').fetchURL;
var getServerFilePath = require('./serverIO').getServerFilePath;
var getSourceServerHost = require('./serverIO').getSourceServerHost;
var localFileBaseURL = require('./serverIO').localFileBaseURL;
var getRedirectLocation = require('./serverIO').getRedirectLocation;
var getURLCacheLocation = require('./serverIO').getURLCacheLocation;
var cachedURIExists = require('./serverIO').cachedURIExists;
var cachingFetchURL = require('./serverIO').cachingFetchURL;


let mergeArrays = (arrays) => [].concat.apply([], arrays)

let logErrors = true
// let logErrors = false

let MIN_VALID_YEAR = 2007

process.on('uncaughtException', function (err) {
    console.log('Migrate process:' , err);
})

const privateDir = '../../../private/'+process.env.REACT_APP_MUNICIPALITY;

const migrateDataDir = privateDir +'/migrate';
const meetingPaths = require(migrateDataDir+'/TablesToScrape.json');
const linkTable = require(migrateDataDir+'/links.json');
const documentPaths = require(migrateDataDir+'/Documents.json');

//========================================
let validRecordType = (recordtype) => ["Agenda", "Minutes", "Video"].includes(recordtype)
let isMailToLink = (uri) => uri.toLowerCase().startsWith('mailto')
let ignoreMailToLink = (record) => !isMailToLink(record.uri)
let onlyLocalDoc = (record) => ['Notice', 'HelpfulInformation', 'Document','Newsletter','Voting','Agenda','Minutes'].includes(record.recordtype) &&
    (!record.remotePath.startsWith('http') ||
    (record.remotePath.startsWith('http') && !record.remotePath.indexOf(getSourceServerHost() !== -1)))
let isPhysicalFile  = (rec)  => (rec.recordtype === 'Video' ? false: true)
let getExtension = (path)=> (path && path.match(/\.[0-9a-z]+$/i, '') && path.match(/\.[0-9a-z]+$/i, '').length > 0) ? path.match(/\.[0-9a-z]+$/i, '')[0] : path

let validYear = (meetingDate) => (meetingDate.getUTCFullYear() < (new Date()).getUTCFullYear()+1 &&
                                                        meetingDate.getUTCFullYear() > MIN_VALID_YEAR )

const expandURI = (uri) => uri.startsWith('/') ? 'http://' + getSourceServerHost() + uri: uri
const remotePathFromExpandedURI = (uri) => uri.replace(new RegExp('https?://'+getSourceServerHost() ), '')

const setDefault = (value, defaultValue)  => (! value || typeof value === 'undefined' ) ? defaultValue: value

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
    return  rec.groupName + '_' + getY_M_D(rec.date) + '_' + rec.label.replace(/ /g, '') +'_'+oldKey + extension
}
//========================================
let onlyUnique = (value, index, self) => self.indexOf(value) === index;
let getY_M_D = (date) =>  date.getUTCFullYear() + "_" + (date.getUTCMonth()<9?'0':'') + (date.getUTCMonth()+1) +  "_" + (date.getUTCDate()<10?'0':'') + (date.getUTCDate());
let getRecordYear = (rec) => rec.date.getUTCFullYear()

//========================================
function extractMeetingTableRows(originalHTML, groupName) {
    let data = originalHTML;
    // console.log('originalHTML:', originalHTML);
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
        console.error("Missing date element???", rowData);
        return
    }
    let meetingDate = dateElement.date
    let groupName = dateElement.groupName

    if (!meetingDate || typeof meetingDate === 'undefined' || isNaN(meetingDate.getTime() )) {
        if (dateElement.dateStr && dateElement.dateStr.search(/^<strong>....<\/strong>$/) >= 0 ) {
            return
        }
        logErrors && console.error("Invalid date:", JSON.stringify(dateElement));
        return
    }
    if (! validYear(meetingDate)) {
        logErrors && console.error("Invalid date:", dateElement.dateStr);
        return
    }
    // if (! validRecordType()) {
    //     logErrors && console.error("Invalid date:", dateElement.dateStr);
    // }

    return rowData.filter(cell => cell.uri).map(doc => {
        let uri = doc.uri
        if (! uri.startsWith('http')) {
            uri = 'http://' + getSourceServerHost() + uri
        }
        let label = doc.label
        if (! validRecordType(label) ) {
            label = translateRecordType(doc.label)
        }

        return {groupName:groupName, date: meetingDate,  label:label, uri:uri, recordtype:label}
    })
}
//========================================
function updateFileDBFileLink(record) {
    let checkRecord={}
    Object.assign(checkRecord, {id: record.id} )
    delete record.id
    return knex('PublicRecords').update(record).where(checkRecord)
    .then(results => {
        if (results && results.length > 0) {
            record.id = checkRecord.id;
        }
        return Promise.resolve([record]);
    })
    .catch(dberr => {
        console.error("DBError:", dberr);
        return Promise.reject(dberr);
    })

}
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
        console.error("DBError:", dberr);
        return Promise.reject(dberr);
    })
}
//========================================
//========================================
// function cloneMeetings(paths) {
//     // console.log('cloneMeetings');
//     return Promise.all(paths.map(record => {
//         console.log('Meetings -',record.group);
//         return fetchURL(record.url)
//         .then(urlData => {
//             const wholePage = urlData.data
//             var $ = cheerio.load(wholePage);
//             return $(record.query).html();
//         })
//         .then( onlyTable => extractMeetingTableRows(onlyTable, record.group) )
//         .then(extractedRows => {
//             // console.log('extractedRows:',extractedRows);
//             let allRecords=[];
//             extractedRows.map((extractedRow, index) => {
//                 if (extractedRow.length > 0 ) {
//                     let dbRecords = dbRecordsFromExtractedRow(extractedRow)
//                     Array.prototype.push.apply(allRecords, dbRecords);
//                 }
//             })
//             // return allRecords.filter(rec => rec.date.getUTCFullYear() === 2012)
//             allRecords.filter(rec=>! validRecordType(rec.label)).map(rec => {
//                 logErrors && console.error(rec.groupName , "Invalid document type:", getY_M_D(rec.date) , '"'+rec.label+'"');
//                 // console.log(rec);
//             })
//
//             return allRecords.filter(rec =>validRecordType(rec.label)  )
//         })
//         .then( pullLocalCopies)
//         .then(pulledLocal => {
//             return pulledLocal.map(rec => {
//                 if (isPhysicalFile(rec)) {
//                     rec.newFilename = newFilenameFromRecord(rec)
//                 }
//                 return rec
//             })
//         })
//         .then(recWithDest => {
//             // Fetch directories (by year) from new server
//             return pullNewServerDirs(getServerFilePath(), recWithDest.map(getRecordYear ).filter(onlyUnique) )
//             .then( serverDirs => {
//                 let allPaths=[];
//                 serverDirs.map( directory => {
//                     directory.map( path => {
//                         allPaths.push(path)
//                     })
//                     return recWithDest
//                 })
//                 // console.log('serverDirs:', allPaths.sort( (a,b) => a.localeCompare(b)));
//                 let notOnServer = (rec) => !allPaths.includes(rec.date.getUTCFullYear() + '/' +rec.newFilename)
//
//                 // Check converted records against server directories
//                 return Promise.all(
//                     recWithDest.filter(notOnServer).filter(isPhysicalFile).map(rec => {
//                         let dest = getServerFilePath() + rec.date.getUTCFullYear() + '/' + rec.newFilename
//                         return pushFileToServer(rec.local, dest)
//                         .then( (pushReq)=> {
//                             return rec
//                         })
//                         .catch(err => console.error(err, rec))
//                     })
//                 )
//                 .then( newFilesUploaded => {
//                     return recWithDest;
//                 })
//             })
//         })
//         .then(filesCopied => {
//             // Log to database if not already there
//             let fileLink = (record) => isPhysicalFile(record)
//                 ? record.date.getUTCFullYear() + '/' + record.newFilename
//                 : record.uri;
//             return Promise.all(
//                 filesCopied.map(rec => {
//                     let dbEntry = {pageLink:rec.groupName, recordtype: rec.label, date:rec.date, fileLink:fileLink(rec)}
//                     return enterIntoDB(dbEntry)
//                 })
//             )
//         })
//
//             }))
// }
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
 links
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
//  Rewrite the fileLinks in the PublicRecords table to change the old
// sites URI to the relative path in the 'serverDirs'
//========================================
function migratePublicRecordURIs() {
    // Fetch PublicRecords that startsWith the sourceHostURI
    // console.log('sql ', knex('PublicRecords').select('*').where('fileLink', 'like', '%' + getSourceServerHost() + '%').toString());
    return knex('PublicRecords').select('*').where('fileLink', 'like', '%' + getSourceServerHost() + '%')
    .then(dbSelectResults => {
            let publicRecordsToMigrate = dbSelectResults.map(rec =>
                Object.assign(rec, {uri: rec.fileLink.replace('www.'+getSourceServerHost(), getSourceServerHost())}))
                .filter(rec => !rec.uri.toLowerCase().endsWith('.php'))
            // console.log('publicRecordsToMigrate:', publicRecordsToMigrate);
            return pullLocalCopies(publicRecordsToMigrate)
            .then(pulledFiles => {
                // console.log('pulledFiles:', pulledFiles);
                let localFileURL = (rec) => 'Documents/' + rec.remotePath.replace(/uploads\//, '').replace(/.*\//,'')

                return pullNewServerDirs(getServerFilePath(), ['Documents'] )
                .then( serverDirs => {
                    let allPaths= mergeArrays(serverDirs)
                    publicRecordsToMigrate = publicRecordsToMigrate.map(rec => {
                        rec.remotePath = rec.uri.replace(/^\//, '')
                        rec.targetPath = getServerFilePath()+ localFileURL(rec)
                        return rec
                    })
                    let notOnServer = (rec) => !allPaths.includes(localFileURL(rec))

                    return Promise.all(
                        publicRecordsToMigrate.filter(notOnServer)
                        .map(rec => {
                            rec.remotePath = remotePathFromExpandedURI(expandURI(rec.uri))
                            return pushFileToServer(rec.local, rec.targetPath)
                            .then( (pushReq)=> {
                                return rec
                            }).catch(err => console.error(err, rec))
                        })
                    )
                    .then(copiedFilesNeeded => publicRecordsToMigrate )
                })
                .then(pushedFiles => {
                    let toDB = publicRecordsToMigrate.map(rec => {
                        rec.targetPath = getServerFilePath()+ localFileURL(rec)
                        rec.fileLink = localFileURL(rec)
                        return {id: rec.id, pageLink:rec.pageLink, fileLink: rec.fileLink}
                    })
                    return toDB
                })
            })
            .then(toLogToDB => {
                return Promise.all(
                toLogToDB
                .map(dbEntry => {
                    return updateFileDBFileLink(dbEntry)
                })
                )
            })
    })
}
//========================================
// function migrateLinks(linksToMigrate) {
//
//     linksToMigrate = linksToMigrate.map(record => {
//         rec.remotePath = remotePathFromExpandedURI(expandURI(rec.uri))
//         record.recordtype = setDefault(record.recordtype, 'Document')
//         record.date = setDefault(record.date, addDays(new Date(), -21))
//         return record;
//     })
//     return Promise.resolve( pullLocalCopies(linksToMigrate)
//     .then(pulledFiles  => {
//         console.log('pulledFiles:', pulledFiles);
//         let localFileURL = (rec) => 'Documents/' + rec.remotePath.replace(/uploads\//, '').replace(/.*\//,'')
//
//         return pullNewServerDirs(getServerFilePath(), ['Documents'] )
//         .then( serverDirs => {
//             let allPaths= mergeArrays(serverDirs)
//             linksToMigrate = linksToMigrate.map(rec => {
//                 rec.targetPath = targetPath = getServerFilePath()+ localFileURL(rec)
//                 return rec
//             })
//             let notOnServer = (rec) => !allPaths.includes(localFileURL(rec))
//
//             return Promise.all(
//                 linksToMigrate.filter(onlyLocalDoc).filter(notOnServer)
//                 .map(rec => pushFileToServer(rec.local, rec.targetPath)
//                     .then( (pushReq)=> {
//                         return rec
//                     }).catch(err => console.error(err, rec))
//                 )
//             )
//             .then(copiedFilesNeeded => pulledFiles )
//         })
//         .then(toLogToDB => {
//             // console.log('toLogToDB:', toLogToDB);
//             let localFileURL = (rec) => rec.remotePath.indexOf('http') !== -1 ? rec.remotePath: 'Documents/' + rec.remotePath.replace(/uploads\//, '')
//
//             return Promise.all(
//                 toLogToDB
//                 .map(rec => {
//                     rec.date = setDefault(rec.date, addDays(new Date(), -21))
//
//                     let dbEntry = {pageLink:rec.group, recordtype: rec.recordtype ,recorddesc: rec.desc, date:rec.date, fileLink:localFileURL(rec)}
//                     // console.log('lnk', dbEntry);
//                     return enterIntoDB(dbEntry)
//                 })
//             )
//         })
//     })
//     .catch(pullErrors =>{
//         console.log('pullErrors', pullErrors);
//     })
// )
// }
//=======================================================
function pullDocumentLinksFromTables(record) {
    // console.log('pullDocumentLinksFromTables(record)',record);
    return fetchURL(record.url)
    .then(urlData => {
        const wholePage = urlData.data
        var $ = cheerio.load(wholePage);
        return getTablesFromPage(wholePage, record.query)
    })
    .then(tablesHTML =>  tablesHTML.map(table =>  extractLinksFromTable(table, record.group) ) )
    .then(tableLinks => mergeArrays(tableLinks) )
    .then( allLinks => {
        return pullLocalCopies(allLinks.filter(rec=>rec.recordtype!=='Redirect'))
        // .then(pulledFiles => {
        //     return allLinks
        // })
    } )
    .then(allTableLinks => {
        // console.log('allTableLinks:',allTableLinks);
        return allTableLinks
    })
}
//=======================================================
function pullLinksFromMenus(wholePage, selector) {
    // console.log('pullLinksFromMenus:', selector);
    var $ = cheerio.load(wholePage);
    const result = $(selector).children().map( (i, el)  => {
        let uri = expandURI($($(el).html()).attr('href'))
        remotePath = remotePathFromExpandedURI(uri)
        return {desc: $(el).text(), uri:uri, remotePath:remotePath, recordtype:'TBD'}
    })
    .get()
    // console.log('pullLinksFromMenus',result);
    return result;
}
//=======================================================
function pullRedirectLinksFromMenus(wholePage, selector) {
    // console.log('pullRedirectLinksFromMenus:', wholePage.length, selector);
    const filterURIs = (rec) => rec.remotePath.indexOf('/links/') >= 0 || rec.remotePath.indexOf('/pages/') >= 0;

    let filteredLinks = pullLinksFromMenus(wholePage, selector).filter(filterURIs).map(rec => {
        rec.recordtype = 'Redirect'
        return rec
    })
    // console.log('pullRedirectLinksFromMenus:', filteredLinks);
    return filteredLinks
}
//=======================================================
function pullDocumentLinksFromMenus(wholePage, selector) {
    // console.log('pullDocumentLinksFromMenus(record)',wholePage.length,selector);
    const filterURIs = (rec) => rec.remotePath.indexOf('/files/') >= 0;

    let filteredLinks =  pullLinksFromMenus(wholePage, selector).filter(filterURIs).map(rec => {
        rec.recordtype = 'Document'
        return rec
    })
    // console.log('filteredLinks:', filteredLinks.length);
    return pullLocalCopies(filteredLinks)
}
//=======================================================
function migrateDocuments(wholePage, conf) {
    const localFileURL = (rec) => 'Documents/' + rec.local.replace(/uploads\//, '').replace(/.*\//,'')

    return pullDocumentLinksFromMenus(wholePage, conf.menuLinkSelector)
    .then(documentLinks => {
        // console.log('migrateDocuments:documentLinks', documentLinks);
        return pullNewServerDirs(getServerFilePath(), ['Documents'] )
        .then( serverDirs => {
            let allPaths= mergeArrays(serverDirs)
            documentLinks = documentLinks.map(rec => {
                rec.targetPath = targetPath = getServerFilePath()+ localFileURL(rec)
                return rec
            })

            let notOnServer = (rec) => !allPaths.includes(localFileURL(rec))

            return Promise.all(
                documentLinks.filter(onlyLocalDoc).filter(notOnServer).map(rec => {
                    return pushFileToServer(rec.local, rec.targetPath)
                    .then( (pushReq)=> {
                        return rec
                    }).catch(err => console.log(err, rec))
                })
            )
            .then(copiedFilesNeeded => documentLinks )
        })
        .then (toLogToDB => {
            // console.log('toLogToDB:', toLogToDB);
            let notEB2Gov = (rec) =>  rec.remotePath.toUpperCase().indexOf('EB2GOV') === -1
            let notnhtaxkiosk = (rec) =>  rec.remotePath.toUpperCase().indexOf('NHTAXKIOSK') === -1
            let localFileURL = (rec) => rec.local.indexOf('http') !== -1 ?
            rec.local:
            'Documents/' + rec.local
            .replace(new RegExp('/.*/'),"")

            return Promise.all(
            toLogToDB.filter(ignoreMailToLink).filter(notEB2Gov).filter(notnhtaxkiosk)
            .map(rec => {
                rec.date = setDefault(rec.date, addDays(new Date(), -21))

                let dbEntry = {pageLink:conf.group, recordtype: rec.recordtype ,recorddesc: rec.desc, date:rec.date, fileLink:localFileURL(rec)}
                // console.log('lnk', dbEntry);
                return enterIntoDB(dbEntry)
            })
            )
        })
    })
}

//=======================================================
function cloneDocuments(paths) {
    return Promise.all(paths.map(record => {
        console.log('Documents -', record.group);
        return pullDocumentLinksFromMenus(record)
        .then(mergedTableLinks => {
            // console.log('mergedTableLinks:',mergedTableLinks);
            let localFileURL = (rec) => 'Documents/' + rec.local.replace(/uploads\//, '').replace(/.*\//,'')

            return pullNewServerDirs(getServerFilePath(), ['Documents'] )
            .then( serverDirs => {
                let allPaths= mergeArrays(serverDirs)
                mergedTableLinks = mergedTableLinks.map(rec => {
                    rec.targetPath = targetPath = getServerFilePath()+ localFileURL(rec)
                    return rec
                })

                let notOnServer = (rec) => !allPaths.includes(localFileURL(rec))

                return Promise.all(
                    mergedTableLinks.filter(onlyLocalDoc).filter(notOnServer).map(rec => {
                        return pushFileToServer(rec.local, rec.targetPath)
                        .then( (pushReq)=> {
                            return rec
                        }).catch(err => console.log(err, rec))
                    })
                )
                .then(copiedFilesNeeded => mergedTableLinks )
            })
            .then (toLogToDB => {
                // console.log('toLogToDB:', toLogToDB);
                let notEB2Gov = (rec) =>  rec.remotePath.toUpperCase().indexOf('EB2GOV') === -1
                let notnhtaxkiosk = (rec) =>  rec.remotePath.toUpperCase().indexOf('NHTAXKIOSK') === -1
                let localFileURL = (rec) => rec.local.indexOf('http') !== -1 ?
                rec.local:
                'Documents/' + rec.local
                .replace(new RegExp('/.*/'),"")

                return Promise.all(
                toLogToDB.filter(ignoreMailToLink).filter(notEB2Gov).filter(notnhtaxkiosk)
                .map(rec => {
                    rec.date = setDefault(rec.date, addDays(new Date(), -21))

                    let dbEntry = {pageLink:record.group, recordtype: rec.recordtype ,recorddesc: rec.desc, date:rec.date, fileLink:localFileURL(rec)}
                    // console.log('lnk', dbEntry);
                    return enterIntoDB(dbEntry)
                })
                )
            })

        })
    }))
}
//=======================================================
function migrateMenuLinkPaths(paths) {
    return Promise.all(paths.map(record => {
        return migrateMenuLinks(record)
    }))
}
//=======================================================
function migrateMenuLinks(wholePage, conf) {
    const notEB2Gov = (rec) =>  rec.uri.toUpperCase().indexOf('EB2GOV') === -1
    const notnhtaxkiosk = (rec) =>  rec.uri.toUpperCase().indexOf('NHTAXKIOSK') === -1

    // console.log('MenuLinks -', conf.group);
    return Promise.all( pullRedirectLinksFromMenus(wholePage, conf.menuLinkSelector).map(getRedirectLocation ) )
    .then(retrievedURIs => {
        // console.log('migrateMenuLinks:retrievedURIs', retrievedURIs);
        return Promise.all(retrievedURIs.filter(ignoreMailToLink).filter(notEB2Gov).filter(notnhtaxkiosk)
            .map(rec => {
                rec.date = setDefault(rec.date, addDays(new Date(), -21))
                let dbEntry = {pageLink:conf.group, recordtype: 'HelpfulInformation' ,recorddesc: rec.desc, date:rec.date, fileLink:rec.uri}
                // console.log('lnk', dbEntry);
                return enterIntoDB(dbEntry)
            })
        )
    })
}
//========================================
function migrateGroupDesc(wholePage, conf) {
    // console.log('migrateGroupDesc:wholePage:',wholePage);
    var $ = cheerio.load(wholePage);
    const query = conf.descriptionSelector
    const result = $(query).html()
    // console.log(conf.group, 'migrateGroupDesc', result.length);
    // console.log(result);
    return result;
}
//========================================
function parseVTSFileArchivePage(wholePage, selector) {
    // console.log('parseVTSFileArchivePage',selector);
    var $ = cheerio.load(wholePage);

    // let selector = 'body > div > table > tbody > tr:nth-child(2) > td.innerCent > table > tbody'
    return  $(selector).children().map( (i, tableRow)  => {
        const uri = $(tableRow).find($("a[target='_top']")).attr('href')
        return {uri:uri.trim(),
            // dateStr:$(tableRow).find($("td[title='Item Details']")).text(),
            fileDate:new Date($(tableRow).find($("td[title='Item Details']")).text()),
            // size:$(tableRow).find($("td[title='Item Size']")).text()
        };
    }).get()
}
//========================================
function migrateVTSArchive(recordType, group, uri, conf) {
    // console.log('migrateVTSArchive', recordType, group, uri);
    const validExtensions = ['.PDF', '.HTML', '.DOCX', '.DOC']

    return cachingFetchURL(uri)
    .then(urlData => {
        const wholePage = urlData.data
        // console.log('parse:', wholePage);
        return Promise.all (parseVTSFileArchivePage(wholePage, conf.selector).map(parsedRecord => {
            // console.log('parsedRecord',parsedRecord);
            const label= conf.extractRecordLabel ? conf.extractRecordLabel(parsedRecord): parsedRecord.uri
            const fullURI = uri.replace(/\/\?.*/,'')+'/'+parsedRecord.uri.trim();
            if (! validExtensions.includes(getExtension(fullURI).toUpperCase())) {
                return cachingFetchURL(fullURI)
                .then(urlData => {
                    return Object.assign({}, parsedRecord,
                        {
                            uri: fullURI,
                            date: conf.getMeetingDate ? conf.getMeetingDate(parsedRecord):parsedRecord.fileDate,
                            groupName:group,
                            recordtype: recordType,
                            local:urlData.location,
                            label:label
                        })
                })
            } else {
                return Promise.resolve(Object.assign({}, parsedRecord,
                    {
                        uri: fullURI,
                        date: conf.getMeetingDate ? conf.getMeetingDate(parsedRecord):parsedRecord.fileDate,
                        groupName:group,
                        recordtype: recordType,
                        label:label
                    })
                )
            }
        }).filter(rec=> rec !== null)
        )
    })
    .then(parsedRecs =>
        pullLocalCopies(parsedRecs)
        .then(pulled => {
            // console.log('migrateVTSArchivePulled', pulled);
            return pulled
        })
    )
    .then(pulledLocal => {
        // console.log('pulledLocal',pulledLocal);
        // const validExtensions = ['.pdf', '.html']
        const hasLocalFile = (rec) => rec.local
        return pulledLocal.filter(hasLocalFile).map(rec => {
            // if (!rec.local) { throw new Error('Missing rec.local:' + require('util').inspect(rec, { depth: null })) }

            if (isPhysicalFile(rec)) {
                rec.newFilename = recordType + '/' + rec.date.getUTCFullYear() + '/'
                const extension = getExtension(rec.local)
                if (rec.label.length > 0) {
                    if (! validExtensions.includes(extension.toUpperCase())) {
                        const errMsg = 'UNK extension:' + extension + ' for\n  ' + require('util').inspect(rec, { depth: null })
                        console.log(errMsg);
                        throw new Error(errMsg)
                    }
                    rec.newFilename += rec.label.replace(/ /g, '_').replace(/,/g, '_').replace(/__/g, '_') + extension
                } else {
                    rec.newFilename += rec.local.replace(/.*\//, '')
                }
            }
            return rec
        })
    })
    .then(withNewFilenames => {
        // console.log('withNewFilenames',withNewFilenames);
        let localFileURL = (rec) => rec.remotePath.replace(/uploads\//, '')
        // .replace(/.*\//,'')
        return pullNewServerDirs(getServerFilePath(), [recordType] )
        .then( serverDirs => {
            let allPaths= mergeArrays(serverDirs)
            let notOnServer = (rec) => !allPaths.includes(localFileURL(rec))
            let withRequiredPaths = withNewFilenames.map(rec => {
                rec.remotePath = rec.newFilename
                rec.targetPath = getServerFilePath()+ localFileURL(rec)
                return rec
            })
            // console.log('withRequiredPaths',withRequiredPaths);
            return Promise.all(
                withRequiredPaths.filter(notOnServer).filter(onlyLocalDoc).map(rec => {
                    // console.log('Push', rec.local, rec.targetPath);
                    return pushFileToServer(rec.local, rec.targetPath)
                    .then( (pushReq)=> {
                        return rec
                    })
                    .catch(err => console.log(err, rec))
                }))
                .then(pushedFiles => {
                    return Promise.all(
                        withNewFilenames.map(rec => {
                            if (!rec.remotePath) { throw new Error('Remote path not set'+ rec)}
                            rec.date = setDefault(rec.date, addDays(new Date(), -21))

                            let dbEntry = {pageLink:rec.groupName, recordtype:recordType ,recorddesc: rec.label, date:rec.date, fileLink:localFileURL(rec)}
                            // console.log('lnk', dbEntry);
                            return enterIntoDB(dbEntry)
                        })
                    )

                    return withNewFilenames
                })
            })
        })
        .catch(err => {
            console.log('Error on file push:', err);
        })
}
//========================================
function migrateAgendas(conf, confP) {
    const recordType = 'Agenda'
    return Promise.all(conf.serverURIs.map(uri => {
        if (uri.indexOf('archive.vt-s.net') != -1 || uri.indexOf('home/dcarpus') != -1) {
            return migrateVTSArchive(recordType,confP.group, uri, conf)
        }
        throw new Error('Unknown uri type' + uri)
    }))
}
//========================================
function migrateMinutes(conf, confP) {
    const recordType = 'Minutes'
    return Promise.all(conf.serverURIs.map(uri => {
        if (uri.indexOf('archive.vt-s.net') != -1 || uri.indexOf('home/dcarpus') != -1) {
            return migrateVTSArchive(recordType,confP.group, uri, conf)
        }
        throw new Error('Unknown uri type' + uri)
    }))
}
//========================================
function migratePage(uri, conf) {
    let wholePage=''
    return cachingFetchURL(uri)
    .then(fetchedData => wholePage = fetchedData.data)
    .then(wholePage => migrateGroupDesc(wholePage, conf) )
    // .then(groupDesc => migrateMenuLinks(wholePage, conf) )
    .then(menuLinks => migrateDocuments(wholePage, conf) )
    // .then(wholePage => migrateAgendas(conf.agendaURI, conf))
    // .then(wholePage => migrateMinutes(conf.minutesURI, conf))
    // return migrateMenuLinks({url:uri, query:conf.menuLinkSelector, group: conf.group})
    .then(documents => migrateAgendas(conf.agendaURI, conf) )
    // return migrateAgendas(conf.agendaURI, conf)
    .then(agendas => migrateMinutes(conf.minutesURI, conf))
    .then(done => {
        console.log('Done migratePage', conf.group);
    })
}
//========================================
//========================================
if (require.main === module) {
    process.on('warning', e => console.warn(e.stack));
    process.setMaxListeners(0);

    const dateRegExps = [
        / +(\d?\d)[\. -](\d?\d)[\. -](\d\d\d?\d?)[ .]*/,
        /^(\d?\d)[\. -](\d?\d)[\. -](\d\d\d?\d?)[. ]*/,
        / +(\d\d)(\d\d)(\d\d)[ .]*/ ,
        /^(\d\d)(\d\d)(\d\d)[ .]*/ ,
    ]

    const dateFromURIText = (uri, recType='UNK') => {
        const regExpressions = dateRegExps.reduce( (acc, value) => {
            const dateSeq = uri.match(new RegExp(value))
            // index 0 of 'match' contains the full match (not split)
            if (dateSeq && dateSeq.length === 4 ) {
                // console.log(value, 'matched', uri);
                const year =Number(dateSeq[3]) < 100? Number(dateSeq[3])+2000: Number(dateSeq[3])
                acc.push(new Date(year, Number(dateSeq[1])-1, dateSeq[2]))
            }
            return acc
        }, [])
        if (regExpressions.length >= 1) {
            return regExpressions[0]
        }
        // console.log('getMeetingDate:' + recType +'\n  ', uri  );
        return null
    }
    // return labelFromURIText(rec.uri, [['BC',''],['Minutes',''],['.pdf',''],[' ','']], 'Minutes')

    const labelFromURIText = (uri, replacements, recType) => {
        let label=replacements.reduce( (acc, value) => {
            // console.log('replace(new RegExp(value[0]), value[1])', value[0], value[1]);
            return acc.replace(new RegExp(value[0]), value[1])
        }, uri)
        label = dateRegExps.reduce( (acc, value) => {
            return acc.replace(new RegExp(value), ' ')
        },label)

        label = label.trim().replace(/^-/, '')
        if (label.length === 6 && !isNaN(label)) {
            label = ''
        }
        // if (label.length > 0) {
        //     console.log(recType, '  ', label.trim());
        // }

        return label
    }


    migratePage('https://www.newdurhamnh.us/board-selectmen',
    {
        group: 'Selectmen',
        menuLinkSelector:"#block-system-main > div > div > div > aside > div.region.region-page-sidebar-first.sidebar > div > nav > div > ul",
        descriptionSelector: '#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article > div > section.field.field-name-field-description.field-type-text-with-summary.field-label-hidden',
        agendaURI: {
            selector: 'body > div > table > tbody > tr:nth-child(2) > td.innerCent > table > tbody',
            serverURIs:[
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSAgendas/2015%20BOS%20Meeting%20Agendas/?Lower=1-20&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSAgendas/2015%20BOS%20Meeting%20Agendas/?Lower=21-40&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSAgendas/2015%20BOS%20Meeting%20Agendas/?Lower=41-60&Upper=1-200',

                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSAgendas/2016%20BOS%20Meeting%20Agendas/?Lower=1-20&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSAgendas/2016%20BOS%20Meeting%20Agendas/?Lower=21-40&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSAgendas/2016%20BOS%20Meeting%20Agendas/?Lower=41-60&Upper=1-200',

                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSAgendas/2017%20BOS%20Meeting%20Agendas/?Lower=1-20&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSAgendas/2017%20BOS%20Meeting%20Agendas/?Lower=21-40&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSAgendas/2017%20BOS%20Meeting%20Agendas/?Lower=41-60&Upper=1-200',
            ],
            extractRecordLabel:  (rec) => {
                return labelFromURIText(rec.uri, [['BOS',''],[/Agenda/i,''],[/\.pdf/i,''],[/\.doc/i,''],['  ',' '],[/Meeting/i,' ']], 'Agenda')
            },
            getMeetingDate:  (rec) => {
                let uri = rec.uri.replace(/BOS /g,'').replace(/Agenda/g,'').replace('.pdf','').replace(/  /g,' ').replace(/^ */,'')
                const retrievedDate = dateFromURIText(uri, 'Agenda')
                return (retrievedDate !== null) ? retrievedDate: rec.fileDate
            }
        },
        minutesURI: {
            selector: 'body > div > table > tbody > tr:nth-child(2) > td.innerCent > table > tbody',
            serverURIs:[
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSMin/2015%20BOS%20Minutes/2015%20Approved/?Lower=1-20&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSMin/2015%20BOS%20Minutes/2015%20Approved/?Lower=21-40&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSMin/2015%20BOS%20Minutes/2015%20Approved/?Lower=41-60&Upper=1-200',

                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSMin/2016%20BOS%20Minutes/2016%20Approved%20Minutes/?Lower=1-20&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSMin/2016%20BOS%20Minutes/2016%20Approved%20Minutes/?Lower=21-40&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSMin/2016%20BOS%20Minutes/2016%20Approved%20Minutes/?Lower=41-60&Upper=1-200',

                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSMin/2017%20BOS%20Minutes/2017%20Approved%20BOS%20Minutes/?Lower=1-20&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSMin/2017%20BOS%20Minutes/2017%20Approved%20BOS%20Minutes/?Lower=21-40&Upper=1-200',
                'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSMin/2017%20BOS%20Minutes/2017%20Approved%20BOS%20Minutes/?Lower=41-60&Upper=1-200',
            ],
            extractRecordLabel:  (rec) => {
                return labelFromURIText(rec.uri, [['BOS',''],[/Minutes/i,''],[/\.pdf/i,''],[/\.doc/i,''],['  ',' '],[/Final Approved/i,'Approved']], 'Minutes')
            },
            getMeetingDate:  (rec) => {
                let uri = rec.uri.replace('BOS','').replace('Minutes','').replace('.pdf','').replace(/  /g,' ').replace(/^ */,'')
                const retrievedDate = dateFromURIText(uri, 'Minutes')
                return (retrievedDate !== null) ? retrievedDate: rec.fileDate
            },
        },
    })
    .then(page =>
    migratePage('https://www.newdurhamnh.us/conservation-commission',
        {
            group: 'ConservationCommission',
            menuLinkSelector:"#block-system-main > div > div > div > aside > div.region.region-page-sidebar-first.sidebar > div > nav > div > ul",
            descriptionSelector: '#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article > div > section.field.field-name-field-description.field-type-text-with-summary.field-label-hidden',
            agendaURI: {
                selector: 'body > div > table > tbody > tr:nth-child(2) > td.innerCent > table > tbody',
                serverURIs:[
                    'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_ConservationAgendas/2017%20Conservation',
                    'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_ConservationAgendas/2016%20Conservation%20Commission%20Agendas/',
                ],
                extractRecordLabel:  (rec) => {
                    return labelFromURIText(rec.uri, [['CCAgenda',''],['CC',''],[/Agenda/i,''],[/\.pdf/i,''],[/\.doc/i,''],['  ',' '],[/Conservation Commision/i,' ']], 'Agenda')
                },
                getMeetingDate:  (rec) => {
                    let uri = rec.uri.replace('CCAgenda','').replace('CC','').replace('Agenda','').replace('.pdf','').replace(/  /g,' ').replace(/^ */,'')
                    const retrievedDate = dateFromURIText(uri, 'Agenda')
                    return (retrievedDate !== null) ? retrievedDate: rec.fileDate
                },
            },
            minutesURI: {
                selector: 'body > div > table > tbody > tr:nth-child(2) > td.innerCent > table > tbody',
                serverURIs:[
                    'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_ConservationMin/2017%20Conservation/',
                    'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_ConservationMin/2016%20Conservation%20Commission%20Minutes/'
                ],
                extractRecordLabel:  (rec) => {
                    return labelFromURIText(rec.uri, [['CC',''],[/Minutes/i,''],[/\.pdf/i,''],[/\.doc/i,''],['  ',' '],[/Conservation Committee/i,' ']], 'Minutes')
                },
                getMeetingDate:  (rec) => {
                    let uri = rec.uri.replace('CC','').replace('Minutes','').replace('.pdf','').replace(/  /g,' ').replace(/^ */,'')
                    const retrievedDate = dateFromURIText(uri, 'Minutes')
                    return (retrievedDate !== null) ? retrievedDate: rec.fileDate
                },
            }
        })
        )
        .then(page =>
        migratePage('https://www.newdurhamnh.us/budget-committee',
            {
                group: 'BudgetCommittee',
                menuLinkSelector:"#block-system-main > div > div > div > aside > div.region.region-page-sidebar-first.sidebar > div > nav > div > ul",
                descriptionSelector: '#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article > div > section.field.field-name-field-description.field-type-text-with-summary.field-label-hidden',
                agendaURI: {
                    selector: 'body > div > table > tbody > tr:nth-child(2) > td.innerCent > table:nth-child(8) > tbody',
                    serverURIs:[
                        'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BudgetAgendas/'
                    ],
                    extractRecordLabel:  (rec) => {
                        return labelFromURIText(rec.uri, [['BCAgenda',''],['BC',''],[/Agenda/i,''],[/\.pdf/i,''],[/\.doc/i,''],['  ',' '],[/Budget Committee/i,' ']], 'Agenda')
                    },
                    getMeetingDate:  (rec) => {
                        let uri = rec.uri.replace('BCAgenda','').replace('BC','').replace('Agenda','').replace('.pdf','').replace(/  /g,' ').replace(/^ */,'')
                        const retrievedDate = dateFromURIText(uri, 'Agenda')
                        return (retrievedDate !== null) ? retrievedDate: rec.fileDate
                    },
                },
                minutesURI: {
                    selector: 'body > div > table > tbody > tr:nth-child(2) > td.innerCent > table > tbody',

                    serverURIs:[
                        'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BudgetMin/2017Budget%20Committee%20Minutes/',
                        'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BudgetMin/2016/',
                        'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BudgetMin/2015/',
                        'http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BudgetMin/2014/',
                    ],
                    extractRecordLabel:  (rec) => {
                        return labelFromURIText(rec.uri, [['BC',''],[/Minutes/i,''],[/\.pdf/i,''],[/\.doc/i,''],['  ',' '],[/Budget Committee/i,' ']], 'Minutes')
                    },
                    getMeetingDate:  (rec) => {
                        let uri = rec.uri.replace('BC','').replace(/Minutes/i,'').replace('.pdf','').replace(/  /g,' ').replace(/^ */,'')
                        const retrievedDate = dateFromURIText(uri, 'Minutes')
                        return (retrievedDate !== null) ? retrievedDate: rec.fileDate
                    },
                }
            })
        )
    .then(done => {
        console.log('done', done);
        // setTimeout(() => process.exit(), 5000);
        process.exit()
    })

    /*
    cloneMeetings(meetingPaths)
    .then(meetingsDone => {
    return cloneDocuments(documentPaths)
})
.then(migrateMenuLinkPaths(linkTable))
.then(migrated => {
console.log('migrated',migrated);
return migrated
})
.then(migratePublicRecordURIs())
.then(done => {
// setTimeout(() => process.exit(), 5000);
process.exit()
})
*/
}
// TODO: Do Cemetery documents via old way (json file in private/json)
// {"group":"Cemetery", "url":"http://miltonnh-us.com/cemetery.php", "query":"table[border='1'][style='width: 500px;']"},

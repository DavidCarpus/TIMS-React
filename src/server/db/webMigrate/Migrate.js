var fs = require('fs');
var toMarkdown = require('to-markdown');
const crc = require('crc');


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
var makeServerDirs = require('./serverIO').makeServerDirs;

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
const pageData = require(migrateDataDir+'/PageData.json');

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
const onlyFileName = (fullPath) => fullPath.replace(/.*\//, '')
const pathWithoutFilename = (path) => path.substr(0, path.lastIndexOf('/'))

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
function enterOnlyIntoDBTable(tableName, record, checkRecord={}){
    let chk={}
    Object.assign(chk, record, checkRecord)
    delete chk.date
    return knex(tableName).select('*').where(chk)
    .then(results => {
        if (results.length === 0) {
            return knex(tableName).insert(record)
        // } else {
        //     logErrors && console.log("Record already exists:" , chk);
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
function addOrUpdateDBTable(tableName, record, checkRecord={}){

    return knex(tableName).select('*').where(checkRecord)
    .then(results => {
        if (results.length === 0) {
            Object.assign(record, checkRecord)
            console.log('ADD record',checkRecord);
            return knex(tableName).insert(record)
            .then(results => {
                if (results && results.length > 0) {
                    record.id = results[0];
                }
                return Promise.resolve([record]);
            })
        } else{
            console.log('UPDATE record',checkRecord);
            return knex(tableName).where(checkRecord).update(record)
        }
    })
    .catch(dberr => {
        console.error("DBError:", dberr);
        return Promise.reject(dberr);
    })
}
//========================================
function enterIntoDB(record) {
    return enterOnlyIntoDBTable('PublicRecords', record, record)
}
//=======================================================
function pullLinksFromMenus(wholePage, selector) {
    // console.log('pullLinksFromMenus:', wholePage.length, selector);
    var $ = cheerio.load(wholePage);
    const result = $(selector).children().map( (i, el)  => {
        let links = $(el).find('a')
        if (links.length === 0) {
            console.error('Missing link', $(el).html().replace(/\t/g,''));
            return { uri: null, desc: $(el).text().trim(), remotePath:'' }
        }
        return $(links).map( (lnkIndex, linkEl) => {
            let link = $(linkEl).attr('href')
            let uri = expandURI(link)
            remotePath = remotePathFromExpandedURI(uri)
            return {desc: $(linkEl).text(), uri:uri, remotePath:remotePath, recordtype:'TBD'}
        }).get()
    })
    .get()
    // console.log('pullLinksFromMenus', result);
    return result;
}
//=======================================================
function pullRedirectLinksFromMenus(wholePage, selector) {
    // console.log('pullRedirectLinksFromMenus:', wholePage.length, selector);
    const filterURIs = (rec) => rec.remotePath.indexOf('/links/') >= 0 ||
        rec.remotePath.indexOf('/pages/') >= 0 ||
        (rec.remotePath.startsWith('http') && rec.remotePath.indexOf( getSourceServerHost()) === -1) // Redirects to existing server

    let filteredLinks = pullLinksFromMenus(wholePage, selector)
    .filter(filterURIs).map(rec => {
        rec.recordtype = 'Redirect'
        return rec
    })
    // console.log('pullRedirectLinksFromMenus:', filteredLinks);
    return filteredLinks
}
//=======================================================
function pullDocumentLinksFromMenus(wholePage, selector) {
    // console.log('pullDocumentLinksFromMenus(record)',wholePage.length,selector);
    const filterURIs = (rec) => rec.remotePath.indexOf('/files/') >= 0 ||
        rec.remotePath.indexOf('/uploads/') >= 0 ||
        rec.remotePath.indexOf('/stories/') >= 0

    let filteredLinks =  pullLinksFromMenus(wholePage, selector).filter(filterURIs).map(rec => {
        rec.recordtype = 'Document'
        return rec
    })
    console.log('pullDocumentLinksFromMenus:', filteredLinks.length);
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
                    .then( (pushReq)=> rec)
                    .catch(err => console.log(err, rec))
                })
            )
            .then(copiedFilesNeeded => documentLinks )
        })
        .then (toLogToDB => {
            // console.log('toLogToDB:', toLogToDB);
            let notEB2Gov = (rec) =>  rec.remotePath.toUpperCase().indexOf('EB2GOV') === -1
            let notnhtaxkiosk = (rec) =>  rec.remotePath.toUpperCase().indexOf('NHTAXKIOSK') === -1
            let localFileURL = (rec) => rec.local.indexOf('http') !== -1 ?
                rec.local: 'Documents/' + rec.local.replace(new RegExp('/.*/'),"")

            return Promise.all(
            toLogToDB.filter(ignoreMailToLink).filter(notEB2Gov).filter(notnhtaxkiosk)
            .map(rec => {
                return enterIntoDB({
                    pageLink:conf.group, recordtype: rec.recordtype ,recorddesc: rec.desc, date:setDefault(rec.date, addDays(new Date(), -21)), fileLink:localFileURL(rec)
                })
            })
            )
        })
    })
}

//=======================================================
function migrateMenuLinks(wholePage, conf) {
    const notEB2Gov = (rec) =>  rec.uri.toUpperCase().indexOf('EB2GOV') === -1
    const notnhtaxkiosk = (rec) =>  rec.uri.toUpperCase().indexOf('NHTAXKIOSK') === -1

    return Promise.all( pullRedirectLinksFromMenus(wholePage, conf.menuLinkSelector).map(getRedirectLocation ) )
    .then(retrievedURIs => {
        return Promise.all(retrievedURIs.filter(ignoreMailToLink).filter(notEB2Gov).filter(notnhtaxkiosk)
            .map(rec => {
                rec.date = setDefault(rec.date, addDays(new Date(), -21))
                let dbEntry = {pageLink:conf.group, recordtype: 'HelpfulInformation' ,recorddesc: rec.desc, date:rec.date, fileLink:rec.uri}
                return enterIntoDB(dbEntry)
            })
        )
    })
}
//========================================
function extractSimpleGroupPageData(wholePage, conf) {
    var $ = cheerio.load(wholePage);
    let group = {
        contact: {
            pageLink:  conf.group,
            groupName:  conf.group,
        },
        groupName: conf.group,
    }
    if (conf.addressSelector) {
        group.contact.street = $(conf.addressSelector).find('.street-address').html().trim()
        group.contact.city = $(conf.addressSelector).find('.locality').html().trim()
        group.contact.postalCode = $(conf.addressSelector).find('.postal-code').html().trim()
    }
    if (conf.phoneSelector) {
        group.contact.phone = $(conf.phoneSelector).html().replace(/\t/g,'').replace(/  /g, ' ')
    }
    if (conf.descriptionSelector) {
        group.descriptionHTML = $(conf.descriptionSelector).html().trim()
        group.description = toMarkdown($(conf.descriptionSelector).html().trim(), { gfm: true })
    }
    return group
}
//========================================
function migrateGroupContact(wholePage, conf) {
    const groupData = extractSimpleGroupPageData(wholePage, conf)

    return addOrUpdateDBTable('Groups', groupData.contact, {pageLink: groupData.groupName})
    .then(contactResult => {
        if (!groupData.description) {
            return Promise.resolve('No description data for group' + groupData.groupName)
        }
        const groupDescription = {markdown:groupData.description, html: groupData.descriptionHTML}
        const indexFieldData = {pageLink: groupData.groupName, sectionName:'desc' }
        return addOrUpdateDBTable('PageText', groupDescription, indexFieldData)
    })
}
//========================================
function parseVTSFileArchivePage(wholePage, selector) {
    // console.log('parseVTSFileArchivePage',selector);
    var $ = cheerio.load(wholePage);

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
    const validExtensions = ['.PDF', '.HTML', '.DOCX', '.DOC', '.ODT']

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
                .catch(err=> {
                    console.error('***Err cachingFetchURL', fullURI, err);
                    return Promise.resolve(null);
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
        const hasLocalFile = (rec) => rec.local
        return pulledLocal.filter(hasLocalFile).map((rec)=> setNewFileName(validExtensions, rec))

    })
    return pushFiles(withNewFilenames)
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
    })
    .catch(err => {
        console.log('Error on file push:', err);
    })
}
//========================================
function setNewFileName(validExtensions, rec) {
    if (!rec.date || typeof rec.date !== 'object') {
        console.error('Date not set for',rec);
        throw new Error(('Date not set for'+rec))
    }
    if (isPhysicalFile(rec)) {
        const extension = getExtension(rec.local)
        if (! validExtensions.includes(extension.toUpperCase())) {
            const errMsg = 'UNK extension:' + extension + ' for\n  ' + require('util').inspect(rec, { depth: null })
            console.log(errMsg);
            throw new Error(errMsg)
        }

        switch (rec.recordtype) {
            case 'Agenda':
                rec.newFilename = rec.recordtype + '/' + rec.date.getUTCFullYear() + '/'
                rec.newFilename += rec.groupName + '_' + getY_M_D(rec.date)  + '_' + crc.crc32( rec.local).toString(16) + extension
                break;
            case 'Minutes':
                rec.newFilename = rec.recordtype + '/' + rec.date.getUTCFullYear() + '/'
                rec.newFilename += rec.groupName + '_' + getY_M_D(rec.date)  + '_' + crc.crc32( rec.local).toString(16) + extension
                break;
            default:
                throw new Error('UNK recordtype:' + rec.recordtype + ' for\n  ' + require('util').inspect(rec, { depth: null }))
        }
        rec.newFilename = rec.newFilename.replace(/ /g, '_').replace(/,/g, '_').replace(/__/g, '_')
    }
    // console.log('rec.newFilename',rec.newFilename, rec.local);
    return rec
}
//========================================
function parseAgendaMeetingTable(wholePage, selector) {
    // console.log('parseAgendaMeetingTable(wholePage, selector)', selector);
    var $ = cheerio.load(wholePage);

    return  $(selector).children().map( (i, tableRow)  => {
        const cells = $(tableRow).children()
        const meetingDate = $(cells[0]).text()
        const agendaUris = $(cells[1]).children().map( (index, element) =>{
            if ($(element).find('a').length > 0) {
                return { uri: $(element).find('a').attr('href'), desc: $(element).text().trim() }
            } else {
                return { uri: $(element).attr('href'), desc: $(element).text().trim() }
            }
        }).get()
        const minutesUris = $(cells[2]).children().map( (index, element) =>{
            if ($(element).find('a').length > 0) {
                return { uri: $(element).find('a').attr('href'), desc: $(element).text().trim() }
            } else {
                return { uri: $(element).attr('href'), desc: $(element).text().trim() }
            }
            // return { uri: $(element).find('a').attr('href'), desc: $(element).text().trim() }
        }).get()
        // const videoUris = cells.length > 3? $(cells[3]).html().replace(/&#xA0;/g,' ').replace(/target="_blank"/, '').trim() : ''
        const videoUris = (cells.length > 3) ?
        $(cells[3]).children().map( (index, element) =>
            ({ uri: $(element).find('a').attr('href'), desc: $(element).text().trim() })
        ).get()
        :
        []

        return {
            meetingDateStr: meetingDate,
            meetingDate: new Date(meetingDate),
            fullHTML: $(tableRow).html().replace(/\t/g,'').replace(/\n/g,''),
            uris: [
                {type:'Minutes', uris: minutesUris},
                {type:'Agenda', uris: agendaUris},
                {type:'Video', uris: videoUris},
            ]
        };
    }).get()
}
//========================================
function migrateTableOfAgendaMinutesAndVideos( group, uri, conf) {
    // const validExtensions = ['.PDF', '.HTML', '.DOCX', '.DOC', '.ODT']
    const validExtensions = ['.PDF', '.DOC', '.DOCX', '.TIF']

    const invalidMeetingDate = (rec) => isNaN( rec.meetingDate.getTime() )
    const hasValidMeetingDate = (rec) => !invalidMeetingDate(rec)
    const noVideos= rec=> rec.recordtype !== 'Video'
    // const pathWithoutFilename = (path) => path.substr(0, path.lastIndexOf('/'))

    // console.log('migrateTableOfAgendaMinutesAndVideos', group, uri,conf);
    return cachingFetchURL(uri)
    .then(urlData => {
        const wholePage = urlData.data
        return parseAgendaMeetingTable(wholePage, conf.selector).reduce( (acc, val) => {
            val.uris.map(uris => {
                let missingURI=false
                acc.push( uris.uris.map(docLink =>{
                    if (!docLink.uri) {
                        missingURI=true
                    }
                    return Object.assign({
                        meetingDateStr:val.meetingDateStr,
                        meetingDate:val.meetingDate,
                        date:val.meetingDate,
                        groupName:group,
                        recordtype:uris.type
                    },
                    docLink)
                }))
            })
            return acc
        }, [])
        .reduce( (acc, val) => { val.map( elem => acc.push(elem)); return acc },[])
        .map( (tableRowData, i) => {
            if (tableRowData.uri && ! tableRowData.uri.startsWith('http') ) {
                tableRowData.uri = 'http://' + getSourceServerHost() + ((!tableRowData.uri.startsWith('/'))?'/':'') + tableRowData.uri
            }
            return tableRowData
        })
    })
    .then(mergedRecords => {
        // console.log('mergedRecords',mergedRecords);
        return Promise.all(
            mergedRecords
            .filter(rec => rec.uri && rec.uri.length > 0)
            .filter(rec => rec.recordtype !== 'Video')
            .map(rec => cachingFetchURL(rec.uri)
                .then(writtenMetaData => {
                    rec.local = writtenMetaData.location
                    return rec
                })
                .catch(err => {
                    console.error(err , rec);
                })
            )
        )
        .then(pulledRecords => mergedRecords)
    })
    .then(pulledFiles => {
        // console.log('pulledFiles',pulledFiles);
        const invalidDataRecord = (rec) => invalidMeetingDate(rec) // || typeof rec.local === 'undefined'
        const validData = (rec) => !invalidDataRecord(rec)

        const configuredFields = pulledFiles
        .filter(validData)
        .map(rec => {
            if (rec.recordtype !== 'Video') {
                if (rec.local) {
                    rec = setNewFileName(validExtensions, rec)
                }
                delete rec.uri
            }
            if (rec.desc === rec.recordtype) { delete rec.desc}
            return rec
        })

        let invalidDataRecs = pulledFiles.filter(invalidDataRecord)
        if (invalidDataRecs.length > 0) {
            console.error( '** Invalid Dates -', invalidDataRecs[0].groupName,
            invalidDataRecs.filter(invalidMeetingDate).map(rec => rec.meetingDateStr + ' -- ' + rec.desc) );
        }
        const missingFiles = configuredFields.filter(noVideos).filter(rec => !rec.newFilename)
        if (missingFiles.length > 0) {
            console.error(missingFiles[0].groupName+ ' items missing files but should not be:\n'+
            missingFiles.map(rec => '\t'+rec.meetingDateStr+ '--'+ rec.recordtype+ '--'+ rec.desc+'\n' ));
        }

        return configuredFields
    })
    .then(withNewFilenames => {
        // throw new Error("Stop")
        return pushFiles(withNewFilenames.filter(noVideos).filter(rec => rec.newFilename))
        .then(afterPushedFiles => {
            const validFileLink = (rec) => rec.uri || rec.relativeDest
            return Promise.all(
                afterPushedFiles.filter(validFileLink).map(rec => {
                    let dbEntry = {pageLink:rec.groupName, recordtype:rec.recordtype ,recorddesc: rec.desc||'', date:rec.meetingDate, fileLink:rec.uri || rec.relativeDest}
                    // console.log('lnk', dbEntry);
                    // return Promise.resolve(dbEntry)
                    return enterIntoDB(dbEntry)
                })
            )
        })
    })
}
//========================================
function parseCurrentAgendas(wholePage, selector) {
    var $ = cheerio.load(wholePage);
    return $(selector).children().map( (i, row)  => {
        const uri = $(row).find($("a")).attr('href')
        const label = $(row).find($("a")).text()
        const dateData = $(row).find($("span")).attr('content')

        return {uri:uri, label:label, date:new Date(dateData) }
    }).get()
}
//========================================
function fetchFileFromPage(url, baseRecordData, currentCnt, maxCnt) {
    // console.log('fetchFileFromPage',url);
    if (currentCnt === maxCnt) {
        return Promise.reject('Exceded maxCnt '+maxCnt+' fetching file from ' + url)
    }
    return cachingFetchURL(url)
    .then(urlData => {
        // console.log('** urlData',urlData.contentType, currentCnt, maxCnt);
        if (urlData.contentType === 'text/html') {
            var $ = cheerio.load(urlData.data);
            const fileSelector = "#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article > div > div.field.field-name-field-agenda-file.field-type-file.field-label-above > div.field-item > span"
            const link = $(fileSelector).find($("a")).attr('href')
            const dateSelector ="#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article > div > div.field.field-name-field-agenda-date.field-type-datetime.field-label-inline.inline > div.field-item > span"
            const date = $(dateSelector).attr('content')
            const recurseBaseRecordData =  Object.assign(baseRecordData,{date:new Date(date)})
            // console.log('fetchFileFromPage:recurse',currentCnt, recurseBaseRecordData.date);
            return fetchFileFromPage(link, recurseBaseRecordData, ++currentCnt, maxCnt)
        }
        else {
            const resultData =  Object.assign(baseRecordData,{uri: url, local:urlData.location})
            // if (resultData.date === 'UNK') {
            //     console.log('fetchFileFromPage',currentCnt, urlData.contentType,resultData.uri);
            // }
            resultData.local = urlData.location
            return resultData
        }
    })
    .catch(err=> {
        console.error("Error fetchFileFromPage",url, baseRecordData);
        return baseRecordData
    })

}
//========================================
function pushFiles(fileRecords) {

    const localPaths = fileRecords.filter(rec => rec.date !== 'UNK')
    .map(rec=> pathWithoutFilename(rec.newFilename))
    .filter((v, i, a) => a.indexOf(v) === i);
    // return Promise.reject('TODO')
    return makeServerDirs(getServerFilePath(), localPaths )
    .then(dirsMade => {
        return pullNewServerDirs(getServerFilePath(), localPaths )
    })
    .then( serverDirs => {
        let allPaths= mergeArrays(serverDirs)
        // console.log('allPaths',allPaths);
        let notOnServer = (rec) => !allPaths.includes(rec.newFilename)
        let withRequiredPaths = fileRecords.map(rec => {
            rec.remotePath = rec.newFilename
            rec.targetPath = getServerFilePath()+ rec.newFilename
            return rec
        })
        return Promise.all(
            withRequiredPaths.filter(notOnServer).map(rec => { //.filter(onlyLocalDoc)
                console.log('Push', rec.local, rec.targetPath);
                return pushFileToServer(rec.local, rec.targetPath)
                .then( (pushReq)=> {
                    return rec
                })
                .catch(err => console.log(err, rec))
        }))
        .then(pushedFiles => {
            return withRequiredPaths
        })
    })
}
//========================================
function migrateCurrentAgendas(recordType, group, uri, conf){
    const validExtensions = ['.PDF', '.HTML', '.DOCX', '.DOC', '.ODT']

    // console.log('migrateCurrentAgendas', recordType, group, uri, conf.currentSelector)
    return cachingFetchURL(uri)
    .then(urlData => {
        return parseCurrentAgendas(urlData.data,conf.currentSelector)
        .map(agenda => {
            if (!agenda.uri.startsWith('http') ) {
                if(!agenda.uri.startsWith('/') ) {
                    agenda.uri = uri + agenda.uri
                } else {
                    agenda.uri = 'http://' + getSourceServerHost() + agenda.uri
                }
            }
            return agenda
        })
    })
    .then(parsedAgendas => {
        return Promise.all( parsedAgendas.map(parsedRecord => {
            const label= conf.extractRecordLabel ? conf.extractRecordLabel(parsedRecord): parsedRecord.uri
            const fullURI = parsedRecord.uri.trim();
            let date = parsedRecord.date
            if (! date && conf.getMeetingDate) { date = conf.getMeetingDate(parsedRecord); console.log('Parse date from record');}
            if ( ! date && parsedRecord.fileDate) { date = parsedRecord.fileDate; console.log('Using fileDate'); }
            if ( ! date ) { date = 'UNK'}
            if (!date || typeof date !== 'object') {
                console.error('Date not set for',parsedRecord);
                throw new Error(('Date not set for'+parsedRecord))
            }

            let baseRecordData = Object.assign({}, parsedRecord,
                {
                    date: date,
                    groupName:group,
                    recordtype: recordType,
                    label:parsedRecord.label? parsedRecord.label: label
                })
              if (! validExtensions.includes(getExtension(fullURI).toUpperCase())) {
                return fetchFileFromPage(fullURI, baseRecordData, 0, 2)
              }
              else {
                  return Promise.resolve(Object.assign({}, baseRecordData, { uri: fullURI}))
              }
          })
        )
    })
    .then(validFiles => {
        const hasLocalFile = (rec) => rec.local
        return validFiles.filter(hasLocalFile).map((rec)=> setNewFileName(validExtensions, rec))
    })
    .then(withNewFilenames => {
        return pushFiles(withNewFilenames)
        .then(pushedFiles => {
            return Promise.all(
                withNewFilenames.map(rec => {
                    if (!rec.remotePath) { throw new Error('Remote path not set'+ rec)}
                    rec.date = setDefault(rec.date, addDays(new Date(), -21))

                    let dbEntry = {pageLink:rec.groupName, recordtype:recordType ,recorddesc: rec.label, date:rec.date, fileLink:rec.newFilename}
                    // console.log('lnk', dbEntry);
                    return enterIntoDB(dbEntry)
                    // return Promise.resolve(dbEntry)
                })
            )
        })
    })
}
//========================================
function migrateAgendas(conf, confP) {
    const recordType = 'Agenda'
    return Promise.all(conf.serverURIs.map(uri => {
        // console.log('migrateAgendas:uri', uri);
        if (uri.indexOf('archive.vt-s.net') != -1 || uri.indexOf('home/dcarpus') != -1) {
            return migrateVTSArchive(recordType,confP.group, uri, conf)
        }
        if (uri.indexOf('miltonnh-us.com') != -1) {
            return migrateTableOfAgendaMinutesAndVideos(confP.group, uri, conf)
        }
        if (uri.indexOf('www.newdurhamnh.us') != -1) {
            return migrateCurrentAgendas(recordType,confP.group, uri, conf)
        }

        throw new Error('** Unknown uri type - ' + uri)
    }))
}
//========================================
function migrateMinutes(conf, confP) {
    const recordType = 'Minutes'
    return Promise.all(conf.serverURIs.map(uri => {
        if (uri.indexOf('archive.vt-s.net') != -1 || uri.indexOf('home/dcarpus') != -1) {
            return migrateVTSArchive(recordType,confP.group, uri, conf)
        }
        throw new Error('** Unknown uri type -' + uri)
    }))
}
//========================================
function migratePage(uri, conf) {
    let wholePage=''
    return cachingFetchURL(uri)
    .then(fetchedData => wholePage = fetchedData.data)
    .then(migrateResults => migrateGroupContact(wholePage, conf) )
    // .then(migrateResults => migrateDocuments(wholePage, conf) )
    // return migrateMenuLinks({url:uri, query:conf.menuLinkSelector, group: conf.group})
    // .then( documents => migrateMinutes(conf.minutesURI, conf))
    // .then(migrateResults => migrateMenuLinks(wholePage, conf) )
    .then(migrateResults => migrateAgendas(conf.agendaURI, conf) )
    .then(done => {
        // console.log('Done migratePage', done);
        return Promise.resolve('Done migratePage '+ conf.group + done.length)
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
    const replaceTextBlocks = (origStr, replacements) => {
        replacements=replacements.map(replacement => {
            // console.log('type:', typeof replacement[0],replacement[0]);
            if (typeof replacement[0] === 'string') { //convert to RegExp
                const modifiers = replacement[0].indexOf('/') >= 0 ? replacement[0].replace(/\/.*\//, ""):''
                const search = replacement[0].indexOf('/') === -1 ? replacement[0] :
                replacement[0].substr(0,replacement[0].lastIndexOf('/')).replace('/','').replace(String.fromCharCode(46),String.fromCharCode(92,46))
                return [new RegExp(search,modifiers), replacement[1]]
            } else { //RegExp
                return [replacement[0], replacement[1]]
            }
        })
        // console.log('replaceTextBlocks +', replacements);
        return replacements.reduce( (acc, value) => {
            return acc.replace(value[0], value[1])
        }, origStr)
    }
    const removeTextBlocks = (origStr, regExpressionStrings) => {
        return regExpressionStrings.reduce( (acc, value) => {
            return acc.replace(new RegExp(value), '')
        }, origStr)
    }

    const dateFromURIText = (uri, recType='UNK') => {
        const regExpressions = dateRegExps.reduce( (acc, value) => {
            const dateSeq = uri.match(new RegExp(value))
            // index 0 of 'match' contains the full match (not split)
            if (dateSeq && dateSeq.length === 4 ) {
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

    const labelFromURIText = (uri, replacements, recType) => {
        let label=replaceTextBlocks(uri, replacements)
        label=removeTextBlocks(label, dateRegExps)

        label = label.trim().replace(/^-/, '')
        if (label.length === 6 && !isNaN(label)) {
            label = ''
        }
        // if (label.length > 0) {
        //     console.log(recType, '  ', label.trim());
        // }

        return label
    }

    // replaceTextBlocks('https://www.newdurhamnh.us/board-selectmen', pageConf.agendaURI.textReplacements)
    // replaceTextBlocks('https://www.newdurhamnh.us/board-selectmen', [['BOS',''],[/Agenda/i,''],[/\.pdf/i,''],[/\.doc/i,''],[/  /g,' '],[/Meeting/i,' ']])

    Promise.all(pageData.map(rec => {
        // console.log('rec', rec.group);
        const pageConf = rec

        if (pageConf.agendaURI) {
            pageConf.agendaURI.extractRecordLabel =  (rec) => {
                return labelFromURIText(rec.uri, pageConf.agendaURI.textReplacements, 'Agenda')
            }
            pageConf.agendaURI.getMeetingDate =  (rec) => {
                const retrievedDate = dateFromURIText(replaceTextBlocks(rec.uri, pageConf.agendaURI.textReplacements), 'Agenda')
                return (retrievedDate !== null) ? retrievedDate: rec.fileDate
            }
        }

        if (pageConf.minutesURI) {
            pageConf.minutesURI.extractRecordLabel =  (rec) => {
                return labelFromURIText(rec.uri, pageConf.minutesURI.textReplacements, 'Minutes')
            }
            pageConf.minutesURI.getMeetingDate =  (rec) => {
                const retrievedDate = dateFromURIText(replaceTextBlocks(rec.uri, pageConf.minutesURI.textReplacements), 'Minutes')
                return (retrievedDate !== null) ? retrievedDate: rec.fileDate
            }
        }
        return migratePage(pageConf.uri, pageConf)
    })
)

    // Promise.resolve('test')

    .then(done => {
        console.log('done', done);
        process.exit()
    })
    .catch(err => {
        console.log('Error', err);
        process.exit()
    })
}
// TODO: Do Cemetery documents via old way (json file in private/json)
// {"group":"Cemetery", "url":"http://miltonnh-us.com/cemetery.php", "query":"table[border='1'][style='width: 500px;']"},

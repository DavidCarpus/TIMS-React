var fs = require('fs');
var toMarkdown = require('to-markdown');
const crc = require('crc');

const cheerio = require('cheerio')
var Config = require('../../config'),
configuration = new Config();
var addDays = require('date-fns/add_days')

var knexConfig = require('../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

var cachingFetchURL = require('./serverIO').cachingFetchURL;
var pullLocalCopies = require('./serverIO').pullLocalCopies;
var makeServerDirs = require('./serverIO').makeServerDirs;
var getServerFilePath = require('./serverIO').getServerFilePath;
var pullNewServerDirs = require('./serverIO').pullNewServerDirs;
var getSourceServerHost = require('./serverIO').getSourceServerHost;
var pushFileToServer = require('./serverIO').pushFileToServer;
var getRedirectLocation = require('./serverIO').getRedirectLocation;

let mergeArrays = (arrays) => [].concat.apply([], arrays)

let defaultConf =     {
    menuLinkSelector:"#block-system-main > div > div > div > aside > div.region.region-page-sidebar-first.sidebar > div > nav > div > ul",
    descriptionSelector: "#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article > div",
    archiveSelector: "body > div > table > tbody > tr:nth-child(2) > td.innerCent > table > tbody",
    agendaURI: {
        baseArchiveURI: "http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_/",
        // selector: "body > div > table > tbody > tr:nth-child(2) > td.innerCent > table > tbody",
        currentAgendasURI: "https://www.newdurhamnh.us/node/36/agenda/2017",
        currentSelector:"#block-system-main > div > div > div",
        // extractRecordLabel: (rec) =>  labelFromURIText(rec.uri, [["/Agenda/i",""],["/.pdf/i",""],["/.doc/i",""],["/  /g"," "],["/Meeting/i"," "]], 'Agenda'),
        extractRecordLabel: (rec) =>  {
            const textBlocks = [["/Agenda/i",""],["/.pdf/i",""],["/.doc/i",""],["/  /g"," "],["/Meeting/i"," "]]
            if (rec.groupLabel) { textBlocks.push(["/"+rec.groupLabel+"/i",""]) }
            if (rec.label) { return replaceTextBlocks(rec.label, textBlocks).trim() }
            return labelFromURIText(rec.uri, textBlocks, 'Agenda')
        }
        ,
        getMeetingDate: (rec) => {
            const retrievedDate = dateFromURIText(replaceTextBlocks([["/Agenda/i",""],["/.pdf/i",""],["/.doc/i",""],["/  /g"," "],["/Meeting/i"," "]]), 'Agenda')
            return (retrievedDate !== null) ? retrievedDate: rec.fileDate
7        }
    },
    minutesURI: {
        baseArchiveURI: "http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_/",
        currentSelector:"#block-system-main > div > div > div",
        // selector: "body > div > table > tbody > tr:nth-child(2) > td.innerCent > table > tbody",
        extractRecordLabel: (rec) =>  {
            const textBlocks = [["/Minutes/i",""],["/.pdf/i",""],["/.doc/i",""],["/  /g"," "],["/Final Approved/i","Approved"]]
            if (rec.groupLabel) { textBlocks.push(["/"+rec.groupLabel+"/",""]) }
            if (rec.label) { return replaceTextBlocks(rec.label, textBlocks).trim() }
            return labelFromURIText(rec.uri, textBlocks, 'Minutes')
        }
        ,
        getMeetingDate: (rec) => {
            const retrievedDate = dateFromURIText(replaceTextBlocks([["/Minutes/i",""],["/.pdf/i",""],["/.doc/i",""],["/  /g"," "],["/Final Approved/i","Approved"]]), 'Minutes')
            return (retrievedDate !== null) ? retrievedDate: rec.fileDate
        }
    }
}

let logErrors = true
// let logErrors = false

let MIN_VALID_YEAR = 2007
// const years =Array.apply(null, Array((new Date(Date.now())).getUTCFullYear() - 2005+1)).map(function (x, y) { return 2005 + y; });  // [1, 2, 3]

const dateRegExps = [
    / +(\d?\d)[\. -](\d?\d)[\. -](\d\d\d?\d?)[ .]*/,
    /^(\d?\d)[\. -](\d?\d)[\. -](\d\d\d?\d?)[. ]*/,
    / +(\d\d)(\d\d)(\d\d)[ .]*/ ,
    /^(\d\d)(\d\d)(\d\d)[ .]*/ ,
]

process.on('uncaughtException', function (err) {
    console.log('Migrate process:' , err);
})

const privateDir = '../../../private/'+process.env.REACT_APP_MUNICIPALITY;

const migrateDataDir = privateDir +'/migrate';
const meetingPaths = require(migrateDataDir+'/TablesToScrape.json');
const linkTable = require(migrateDataDir+'/links.json');
const documentPaths = require(migrateDataDir+'/Documents.json');
const pageData = require(migrateDataDir+'/PageData.json');
const groupTranslate = require(migrateDataDir+'/MeetingArchiveNames.json');

//========================================
let validRecordType = (recordtype) => ["Agenda", "Minutes", "Video"].includes(recordtype)
let isMailToLink = (uri) => uri && uri.toLowerCase().startsWith('mailto')
let ignoreMailToLink = (record) => !isMailToLink(record.uri)
let onlyLocalDoc = (record) => ['Notice', 'HelpfulInformation', 'Document','Newsletter','Voting','Agenda','Minutes'].includes(record.recordtype) &&
    (!record.remotePath.startsWith('http') ||
    (record.remotePath.startsWith('http') && !record.remotePath.indexOf(getSourceServerHost() !== -1)))
let isPhysicalFile  = (rec)  => (rec.recordtype === 'Video' ? false: true)
let getExtension = (path)=> (path && path.match(/\.[0-9a-z]+$/i, '') && path.match(/\.[0-9a-z]+$/i, '').length > 0) ? path.match(/\.[0-9a-z]+$/i, '')[0] : path

let validYear = (meetingDate) => (meetingDate.getUTCFullYear() < (new Date()).getUTCFullYear()+1 &&
                                                        meetingDate.getUTCFullYear() > MIN_VALID_YEAR )

// const expandURI = (uri) => uri.startsWith('/') ? 'http://' + getSourceServerHost() + uri: uri
const expandURI = (uri) => !uri.toLowerCase().startsWith('http:') ? 'http://' + getSourceServerHost() + (uri.startsWith('/')?uri:'/'+uri): uri
const remotePathFromExpandedURI = (uri) => uri.replace(new RegExp('https?://'+getSourceServerHost() ), '')

const setDefault = (value, defaultValue)  => (! value || typeof value === 'undefined' ) ? defaultValue: value
const onlyFileName = (fullPath) => fullPath.replace(/.*\//, '')
const pathWithoutFilename = (path) => path.substr(0, path.lastIndexOf('/'))
const fullURIFromHref = (uri, href) => {
    let host = uri.match(/http:\/\/.*?\//).length === 1? uri.match(/http:\/\/.*?\//)[0].slice(0,-1):""
    host = host.indexOf('?') !== -1? host.replace(/\?.*/, ''):host
    return (href.startsWith('/')? host + href : uri.replace(/\?.*/, '') + href)
}
const makeObjArrayUniq = (objArr, uniqFun) => objArr.reduce( (acc, val) =>{
        const chkFunc = (val2) => uniqFun(val, val2);
        if (acc.findIndex( chkFunc ) < 0) { acc.push(val)};
        return acc;
    },[])

//========================================
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
    replacements.push(["/"+recType+"/",""])
     let label=replaceTextBlocks(uri, replacements)
    label=removeTextBlocks(label, dateRegExps)

    label = label.trim().replace(/^-/, '')
    if (label.length === 6 && !isNaN(label)) {
        label = ''
    }
    return label
}

//========================================
let onlyUnique = (value, index, self) => self.indexOf(value) === index;
let getY_M_D = (date) =>  date.getUTCFullYear() + "_" + (date.getUTCMonth()<9?'0':'') + (date.getUTCMonth()+1) +  "_" + (date.getUTCDate()<10?'0':'') + (date.getUTCDate());
let getRecordYear = (rec) => rec.date.getUTCFullYear()
let getM_D_Y = (date) =>
(date.getUTCMonth()<9?'0':'') + (date.getUTCMonth()+1) +  "/" +
(date.getUTCDate()<10?'0':'') + (date.getUTCDate())+  "/" +
date.getUTCFullYear()

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
        const errMsg = "DBError:"+ dberr.errorno
        console.error(errMsg);
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
        } else {
            return null
        }
    })
    .then(results => {
        if (results && results.length > 0) {
            record.id = results[0];
        }
        return Promise.resolve([record]);
    })
    .catch(dberr => {
        const errMsg = "DBError:"+ dberr.errorno
        console.error(errMsg);
        return Promise.reject(dberr);
    })
}
//========================================
function addOrUpdateDBTable(tableName, record, checkRecord={}){
    return knex(tableName).select('*').where(checkRecord)
    .then(results => {
        if (results.length === 0) {
            Object.assign(record, checkRecord)
            // console.log('ADD record',checkRecord);
            return knex(tableName).insert(record)
            .then(results => {
                if (results && results.length > 0) {
                    record.id = results[0];
                }
                return Promise.resolve([record]);
            })
        } else{
            // console.log('UPDATE record',checkRecord);
            return knex(tableName).where(checkRecord).update(record)
        }
    })
    .catch(dberr => {
        const errMsg = "DBError:"+ dberr.errorno
        console.error(errMsg);
        return Promise.reject(dberr);
    })
}
//========================================
function enterIntoDB(record) {
    // console.log('enterIntoDB');

    return enterOnlyIntoDBTable('PublicRecords', record, record)
}
//=======================================================
function pullLinksFromMenus(wholePage, selector) {
    // console.log('pullLinksFromMenus',wholePage.length,selector);
    var $ = cheerio.load(wholePage);
    const allLnks = $(selector).children().map( (i, el)  => {
        let links = $(el).find('a')
        if (links.length === 0) {
            console.error('Missing link', $(el).html().replace(/\t/g,''));
            return { uri: null, desc: $(el).text().trim(), remotePath:'' }
        }
        // const lnks = []
        // return
        const lnks = $(links).map( (lnkIndex, linkEl) => {
            let link = $(linkEl).attr('href')
            let uri = expandURI(link)
            const remotePath = remotePathFromExpandedURI(uri)
            const result = {desc: $(linkEl).text(), uri:uri, remotePath:remotePath, recordtype:'TBD'}
            // console.log('pullLinksFromMenus:result:',result);
            // lnks.push(result)
            return result
        })
        // .get()
        const lnkArray = lnks.toArray()
        // console.log('lnkArray', lnkArray);
        return lnkArray
    })
    // console.log('allLnks', allLnks.length);
    const allLnksArray = allLnks.toArray()
    // console.log('allLnksArray',allLnksArray);
    return allLnksArray
}
//=======================================================
function pullRedirectLinksFromMenus(wholePage, selector) {
    // console.log('pullRedirectLinksFromMenus');
    const filterURIs = (rec) => rec.remotePath.indexOf('/links/') >= 0 ||
        rec.remotePath.indexOf('/pages/') >= 0 ||
        (rec.remotePath.startsWith('http') && rec.remotePath.indexOf( getSourceServerHost()) === -1) // Redirects to existing server

    // return pullLinksFromMenus(wholePage, selector)
    const links = pullLinksFromMenus(wholePage, selector)
    // console.log('pullRedirectLinksFromMenus:results',links);
    const results =  links
    .filter(filterURIs).map(rec => Object.assign({}, rec, {recordtype: 'Redirect'}))
    // console.log('pullLinksFromMenus : results',results);
    return results
    // {
    //     console.log('pullRedirectLinksFromMenus:set Redirect recordtype');
    //     rec.recordtype = 'Redirect'
    //     return rec
    // })
}
//=======================================================
function pullDocumentLinksFromMenus(wholePage, selector) {
    // console.log('pullDocumentLinksFromMenus');
    const filterURIs = (rec) => rec.remotePath.indexOf('/files/') >= 0 ||
        rec.remotePath.indexOf('/uploads/') >= 0 ||
        rec.remotePath.indexOf('/stories/') >= 0

    return pullLocalCopies(pullLinksFromMenus(wholePage, selector).filter(filterURIs).map(rec => {
        rec.recordtype = 'Document'
        return rec
    }))
}
//=======================================================
function migrateDocuments(wholePage, conf) {
    const localFileURL = (rec) => 'Documents/' + rec.local.replace(/uploads\//, '').replace(/.*\//,'')

    return pullDocumentLinksFromMenus(wholePage, conf.menuLinkSelector)
    .then(documentLinks => {
        // console.log('**migrateDocuments:documentLinks', conf.group, wholePage.length, documentLinks.map(rec=>rec.uri));
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
    const notEB2Gov = (rec) =>  rec.uri && rec.uri.toUpperCase().indexOf('EB2GOV') === -1
    const notnhtaxkiosk = (rec) =>  rec.uri && rec.uri.toUpperCase().indexOf('NHTAXKIOSK') === -1

    const badLinks = [
        "http://www.newdurhamnh.us/building-inspector/links/assessment-database",
        "https://www.newdurhamnh.us/recreation/links/new-durham-recreation-website",
        "http://www.newdurhamnh.us/recreation/links/new-durham-recreation-website",
        "http://www.newdurhamnh.us/tax-collector/links/online-property-assessments",
        "https://www.newdurhamnh.us/tax-collector/links/online-property-assessments",
        // "https://www.newdurhamnh.us/recreation/links/powder-mill-snowmobile-club",
    ]

    const links = pullRedirectLinksFromMenus(wholePage, conf.menuLinkSelector).filter(link=> badLinks.indexOf(link.uri) === -1)

    // console.log('links',links);
    // const localRedirects = links.filter(link=> link.uri.indexOf('/pages/')>=0)
    // const remoteRedirects = links.filter(link=> link.uri.indexOf('/links/')>=0)
    // console.log('localRedirects',localRedirects);
    // console.log('remoteRedirects',remoteRedirects);
    // console.log('cachingFetchURL', remoteRedirects[0].uri);
    // return cachingFetchURL(  remoteRedirects[0].uri )
    // .then(urlData => {
    //     console.log(Object.keys(urlData));
    //     throw new Error("Modify to pull redirects in sequence and not parallel")
    // })
    // throw new Error("Modify to pull redirects in sequence and not parallel")

    return Promise.all( links.map(getRedirectLocation ) )
    .then(retrievedURIs => {
        // console.log('migrateMenuLinks:retrievedURIs',retrievedURIs);
        return Promise.all(retrievedURIs.filter(ignoreMailToLink).filter(notEB2Gov).filter(notnhtaxkiosk)
            .map(rec => {
                rec.date = setDefault(rec.date, addDays(new Date(), -21))
                let dbEntry = {pageLink:conf.group, recordtype: 'HelpfulInformation' ,recorddesc: rec.desc, date:rec.date, fileLink:rec.uri}
                // console.log('lnk',dbEntry);
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

    // console.log('migrateGroupContact',wholePage.length, groupData.groupName, '\n',groupData.descriptionHTML.substr(0,200));

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
                    console.error('***Err cachingFetchURL', fullURI);
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
        pullLocalCopies(parsedRecs.filter(rec=> rec !== null))
        .then(pulled => parsedRecs )
        .catch(err=> {
            console.error('***Err pullLocalCopies', err);
        })
    )
    .then(pulledLocal => {
        const hasLocalFile = (rec) => rec && rec.local
        const validExtension = (rec) => rec && validExtensions.includes(getExtension(rec.local).toUpperCase())
        const inValidExtension = (rec) => !validExtension(rec)
        const invalid = pulledLocal.filter(hasLocalFile).filter(inValidExtension)
        if (invalid.length > 0) {
            console.error('invalid extensions', invalid.map(rec=> rec.uri));
        }
        pulledLocal  = pulledLocal.filter(hasLocalFile).filter(validExtension).map((rec)=> setNewFileName(validExtensions, rec))
        return pulledLocal
    })
    .then(withNewFilenames => {
        return pushFiles(withNewFilenames)
        .then(pushedFiles => {
            // console.log('pushedFiles', pushedFiles.length);
            return Promise.all(
                withNewFilenames.map(rec => {
                    // if (!rec.remotePath) { throw new Error('Remote path not set'+ rec)}
                    rec.date = setDefault(rec.date, addDays(new Date(), -21))

                    let dbEntry = {pageLink:rec.groupName, recordtype:recordType ,recorddesc: rec.label, date:rec.date, fileLink:rec.newFilename}
                    // console.log('lnk', dbEntry);
                    return enterIntoDB(dbEntry)
                })
            )
        })
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
        if (extension.length > 6 || !validExtensions.includes(extension.toUpperCase())) {
            const errMsg = 'UNK extension: "' + extension + '" for\n  ' + require('util').inspect(rec, { depth: null })
            // console.log(errMsg);
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
    const validExtensions = ['.PDF', '.DOC', '.DOCX', '.TIF']

    const invalidMeetingDate = (rec) => isNaN( rec.meetingDate.getTime() )
    const hasValidMeetingDate = (rec) => !invalidMeetingDate(rec)
    const noVideos= (rec)=> rec.recordtype !== 'Video'
    const uriToFullPathURI= (uri) => uri.startsWith('http') ? uri: 'http://' + getSourceServerHost() + ((!uri.startsWith('/'))?'/':'') + uri

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
        .reduce( (acc, val) => { val.map( elem => acc.push(elem)); return acc },[]) //Remove duplicates
        .map( tableRowData => {
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
                    rec = (validExtensions, rec)
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
function parseCurrentMeetingDoc(wholePage, selector) {
    var $ = cheerio.load(wholePage);
    return $(selector).children().map( (i, row)  => {
        const uri = $(row).find($("a")).attr('href')
        const label = $(row).find($("a")).text()
        const dateData = $(row).find($("span")).attr('content')

        return {uri:uri, label:label, date:new Date(dateData) }
    }).get()
}
//========================================
function fetchFilesFromPage(linkData, baseRecordData, currentCnt, maxCnt) {
    if (currentCnt === maxCnt) {
        return Promise.reject('Exceded maxCnt '+maxCnt+' fetching file from ' + linkData)
    }
    return Promise.all(linkData.map(uri => {
        // console.log('fetch:',uri.uri);
        return cachingFetchURL(uri.uri)
        .then(urlData => {
            // console.log('** urlData',urlData.contentType, currentCnt, maxCnt);
            if (urlData.contentType === 'text/html') {
                var $ = cheerio.load(urlData.data);
                const contentSelector = "#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article > div "
                // console.log("contentSelector", $(contentSelector).find('.field-type-file').find('.field-item').length, $(contentSelector).find('.field-type-file').find('.field-item').html());
                const links = $(contentSelector).find('.field-type-file').find('.field-item').map( (i, item) => {
                    const uri = $(item).find($("a")).attr('href')
                    const label = $(item).find($("a")).text()
                    return {uri:uri, label:label }
                }).get()

                let date = $(contentSelector + "> div.field.field-name-field-meeting-date.field-type-datetime.field-label-inline.inline > div.field-items > div > span").attr('content')
                if (typeof date === 'undefined') {date = $(contentSelector + "> div.field.field-name-field-agenda-date.field-type-datetime.field-label-inline.inline > div.field-item > span").attr('content')}
                if (typeof date === 'undefined') { console.error('Unable to determine date for ',uri.uri);}

                const recurseBaseRecordData =  Object.assign({},baseRecordData,{date:new Date(date)})
                return fetchFilesFromPage(links, recurseBaseRecordData, ++currentCnt, maxCnt)
            }
            else {
                return Promise.resolve(Object.assign({},baseRecordData,{uri: uri.uri, local:urlData.location }))
            }
        })
    .catch(err=> {
        console.error("Error ",uri.uri, baseRecordData, err);
        return baseRecordData
    })
}))

}
//========================================
function pushFiles(fileRecords) {

    const localPaths = fileRecords.filter(rec => rec.date !== 'UNK')
    .map(rec=> pathWithoutFilename(rec.newFilename))
    .filter((v, i, a) => a.indexOf(v) === i);

    return makeServerDirs(getServerFilePath(), localPaths )
    .then(dirsMade => {
        return pullNewServerDirs(getServerFilePath(), localPaths )
    })
    .then( serverDirs => {
        let allPaths= mergeArrays(serverDirs)
        let notOnServer = (rec) => !allPaths.includes(rec.newFilename)

        let withRequiredPaths = fileRecords.map(rec => {
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
function migrateCurrentMeetingDocs(recordType, group, groupLabel, uri, conf){
    const validExtensions = ['.PDF', '.HTML', '.DOCX', '.DOC', '.ODT']

    if (!uri.startsWith('http') ) {
        if(!uri.startsWith('/') ) {
            uri = uri + uri
        } else {
            uri = 'http://' + getSourceServerHost() + uri
        }
    }
    // console.log('migrateCurrentMeetingDocs', recordType, group, uri, conf.currentSelector)
    return cachingFetchURL(uri)
    .then(urlData => {
        return parseCurrentMeetingDoc(urlData.data,conf.currentSelector)
        .map(meetingDoc => {
            if (!meetingDoc.uri.startsWith('http') ) {
                if(!meetingDoc.uri.startsWith('/') ) {
                    meetingDoc.uri = uri + meetingDoc.uri
                } else {
                    meetingDoc.uri = 'http://' + getSourceServerHost() + meetingDoc.uri
                }
            }
            return meetingDoc
        })
    })
    .then(parsedAgendas => {
        return Promise.all( parsedAgendas.map(parsedRecord => {
            // console.log(parsedRecord.uri);
            parsedRecord.groupLabel = groupLabel
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
                    label: label
                })
              if (! validExtensions.includes(getExtension(fullURI).toUpperCase())) {
                  return fetchFilesFromPage([{uri:fullURI}], baseRecordData, 0, 2)
              }
              else {
                  return Promise.resolve(Object.assign({}, baseRecordData, { uri: fullURI}))
              }
          })
        )
    })
    .then(validFiles => {
        // console.log('validFiles', require('util').inspect(validFiles, { depth: null }));
        const hasLocalFile = (rec) => rec && rec.local
        return validFiles.reduce( (acc, val) => {
            if (Array.isArray(val[0])) {
                acc = val[0].reduce( (accElem, valElem) => {
                    return  accElem.concat(valElem)
                }, acc)
            } else {
                acc.push(val[0])
            }
            return acc
        },[])
        .filter(hasLocalFile).map((rec)=> setNewFileName(validExtensions, rec))
    })
    .then(withNewFilenames => {
        // console.log('withNewFilenames', withNewFilenames);
        return pushFiles(withNewFilenames)
        .then(pushedFiles => {
            return Promise.all(
                withNewFilenames.map(rec => {
                    // if (!rec.remotePath) { throw new Error('Remote path not set'+ rec)}
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
            console.log('migrateAgendas:migrateCurrentMeetingDocs');
            return migrateCurrentMeetingDocs(recordType,confP.group, confP.group, uri, conf)
        }

        throw new Error('** Unknown uri type - ' + uri)
    }))
}
//========================================
function migrateMinutes(conf, confP) {
    const recordType = 'Minutes'
    return Promise.all(conf.serverURIs.map(uri => {
        if (uri.indexOf('archive.vt-s.net') != -1 ) {
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
    .then(migrateResults => migrateDocuments(wholePage, conf) )
    .then(migrateResults => migrateMinutes(conf.minutesURI, conf))
    .then(migrateResults => migrateMenuLinks(wholePage, conf) )
    .then(migrateResults => migrateAgendas(conf.agendaURI, conf) )
    .then(done => {
        // console.log('Done migratePage', done);
        return Promise.resolve('Done migratePage '+ conf.group)
    })
}
//========================================
function getGroupArchivePage(groupName, groupLabel, recordType) {
    const baseURI = "http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/"
    const indexPageURI = baseURI +"index"
    const tableSelector = "body > div > table > tbody > tr:nth-child(2) > td.innerCent > table.incTableShell > tbody"

    return cachingFetchURL(indexPageURI)
    .then(fetchedData => wholePage = fetchedData.data)
    .then(fetchResults => {
        var $ = cheerio.load(wholePage);
        return $(tableSelector).children().map( (i, row)  =>
            $(row).find('div').children().map( (ri, rec) => {
                if ((recordType==='Minutes' && ri === 0) || (recordType==='Agenda' && ri === 1)) {
                    if (groupTranslate.filter(grp => grp.groupName === groupLabel.trim() && $(rec).text().trim() === grp.colText ).length > 0 ) {
                        return $(rec).attr('href')
                    }
                }
            }).get()
        ).get()
    })
    .then(rws =>  (rws.length === 0)? null: baseURI + rws[0] )
}
//========================================
function pullPageLinksFromURI(maxDepth, acc, currDepth, uri) {
    // console.log('pullPageLinksFromURI', uri);
    return cachingFetchURL(uri)
    .then(fetchedData => {
        if (fetchedData.contentType === 'text/html') {
            if (maxDepth <= currDepth) { console.log('Exceeded maxDepth', maxDepth); return Promise.resolve(acc) }

            var $ = cheerio.load(fetchedData.data);
            const allAnchors = $(fetchedData.data).find('.innerCent').find('a').filter( (i,el) => $(el).attr('href'))
            const pageLinks = $(allAnchors).filter( (i,el) => ! $(el).attr('target')  && ! $(el).text().startsWith('Printer-Friendly') )
            if (pageLinks && pageLinks.length > 0) {
                const missingPages =pageLinks.map( (linkIndex, link) => {
                    return fullURIFromHref(uri, $(link).attr('href'))
                }).get()
                .filter(lnk=>lnk!== uri)
                .filter(subPageLink => acc.indexOf(subPageLink) === -1 )

                if (missingPages.length > 0) {
                    return Promise.all(missingPages.map(subPageLink => {
                        return pullPageLinksFromURI(maxDepth, acc.slice().concat(missingPages),  currDepth+1, subPageLink)
                    }))
                    .then(allPulled => Promise.resolve(mergeArrays(acc.concat(allPulled))
                        .filter(elem => typeof elem !== 'undefined')
                        .filter(onlyUnique))
                    )
                }
            } else { // No pageLinks
                return Promise.resolve([uri])
            }
        }
    })
    .catch(err=> {
        console.log('pullPageLinksFromURI err', err);
    })
}
//========================================
function pullFileRecordsFromURI( uri) {
    return cachingFetchURL(uri)
    .then(fetchedData => {
        const fileURL = (href) => uri.replace(/\?.*/,'') + href
        if (fetchedData.contentType === 'text/html') {
            var $ = cheerio.load(fetchedData.data);
            return $(fetchedData.data).find('.folderRow').map( (rowIndex, row) => {
                const uri=fileURL( $(row).find('a').attr('href') )
                if(!$(row).find('a').attr('target')) return null
                return {
                    uri:uri,
                    label: $(row).find('a').text(),
                    date:new Date($(row).find('td').filter( (i,el) => $(el).attr('title')==='Item Details').text()),
                    uriCRC:crc.crc32( uri ).toString(16)
                }
            }).get().filter(rec => rec !== null)
        }
    })
    .catch(err => console.log('** Err:pullFileRecordsFromURI', uri, err))
}
//========================================
function fetchLocalFile(archiveRecord) {
    return cachingFetchURL(archiveRecord.uri)
    .then(urlData => {
        // console.log('fetchLocalFile', archiveRecord.groupName , archiveRecord.date.getUTCFullYear() , urlData.location.substr(urlData.location.lastIndexOf('/')) );
        return Object.assign({},archiveRecord, {local: urlData.location, contentType:urlData.contentType})
    })
    .catch(err=> {
        console.error('fetchLocalFile (err):',err);
        return archiveRecord;
    })
}
//========================================
function migrateGroupArchiveDocument(serverDirs, archiveRecord) {
    let notOnServer = (rec) => !serverDirs.includes(rec.newFilename)
    // console.log('serverDirs',serverDirs);
    return cachingFetchURL(archiveRecord.uri)
    .then(urlData => {
        if(notOnServer(archiveRecord)){
            return pushFileToServer(urlData.location, getServerFilePath()+ archiveRecord.newFilename)
            .then(pushDestination =>  Promise.resolve(true))
        } else {
            return Promise.resolve(false)
        }
    })
    .then(pushed => {
        const badLabels = [
            'Adobe Acrobat Document', 'Adobe Acrobat 7.0 Document', 'PDF Document', 'Microsoft Word Document', 'Microsoft Office Word 97 - 2003 Document',
            archiveRecord.groupLabel + ' ' + archiveRecord.recordtype,
            archiveRecord.groupLabel + ' ' + archiveRecord.recordtype + ' for ' + getM_D_Y(archiveRecord.date),
        ]
        // console.log('badLabels',badLabels);
        let label = badLabels.indexOf(archiveRecord.label) >= 0 ? '':archiveRecord.label
        let dbEntry = {pageLink:archiveRecord.groupName, recordtype:archiveRecord.recordtype ,recorddesc: label, date:archiveRecord.date, fileLink:archiveRecord.newFilename}
        return enterIntoDB(dbEntry)
    })
}
//========================================
async function pullFiles(fileLinksToPull) {
    let results=[]
    for ( let fileToPull of fileLinksToPull){
        let pulledFile = await fetchLocalFile(fileToPull)
        results.push(pulledFile)
    }
    // console.log('results',results);
    return results
}
//========================================
function migrateGroupArchivePages(groupName, groupLabel) {
    console.log('migrateGroupArchivePages', groupLabel);
    return getGroupArchivePage(groupName, groupLabel, 'Agenda')
    .then(agendaPageURI => {
        const validExtensions = ['.PDF', '.DOC', '.DOCX', '.TIF', '.ZIP']
        // console.log('agendaPageURI',agendaPageURI);

        return pullPageLinksFromURI(5, [], 0, agendaPageURI + '/'  ) //+ '/2008/'  2008%20BOS%20MEETING%20AGENDAS/
        .then(pageLinks =>  {
            // console.log('pageLinks',pageLinks);
            if (pageLinks && pageLinks.length > 0) {
                // console.log('pageLinks:', pageLinks.length, groupName);
                let pcnt = 0
                const pageLinkRequests = pageLinks.map(pageLink => pullFileRecordsFromURI(pageLink) )
                // const pageLinkRequests = pageLinks.map(pageLink => Promise.resolve([pcnt++]) )

                return pageLinkRequests.reduce( (prevReq, fetchReq) => {
                    return prevReq.then( (pr)=> {
                        // console.log('pr', pr.length);
                        return fetchReq.then(frResult => pr.concat(frResult))
                    })
                }, Promise.resolve([]))
                // return Promise.all( pageLinks.map(pageLink => pullFileRecordsFromURI(pageLink) ))
            } else {
                console.log('No pageLinks for', groupName, agendaPageURI);
                return Promise.resolve([])
            }
        })
        .then(fileRecordArrays =>  {
            // throw new Error(fileRecordArrays)
            // console.log('fileRecordArrays',fileRecordArrays);
            return mergeArrays(fileRecordArrays)
        })
        .then(fileRecords => makeObjArrayUniq(fileRecords, (a,b) => a.uriCRC === b.uriCRC ))
        .then( uniqFileRecords => uniqFileRecords.map( rec => Object.assign({},rec, {recordtype: 'Agenda', groupName:groupName, groupLabel:groupLabel}) ) )
        .then( addedTypeInfo =>{
            return pullFiles(addedTypeInfo)
        })
        .then( withLocalFileFetched => {
            if (withLocalFileFetched && withLocalFileFetched.length > 0) {
                // console.log('withLocalFileFetched',withLocalFileFetched.length);
                return withLocalFileFetched
                .filter(rec=> rec.contentType !== 'text/html' && typeof rec.local !== 'undefined') // local is undefined if we got a 404
                .map( rec=> setNewFileName(validExtensions, rec))
            } else {
                console.log('No withLocalFileFetched for', groupName);
                return Promise.resolve([])
            }
        })
        .then( readyToMigrate => {
            // console.log('readyToMigrate',readyToMigrate.length);
            const serverPaths = readyToMigrate.reduce( (acc,val) => { return acc.concat(pathWithoutFilename(val.newFilename))}, []).filter(onlyUnique);
            return makeServerDirs(getServerFilePath(), serverPaths )
            .then(dirsMade => pullNewServerDirs(getServerFilePath(), serverPaths ))
            .then( serverDirs => {
                return Promise.all(readyToMigrate.map( (rec)=> migrateGroupArchiveDocument(mergeArrays(serverDirs),rec)))
            })
        } )


        .then(migratedRecords => migratedRecords.length )
        .then( getGroupArchivePage(groupName, groupLabel, 'Minutes') )
    })
    // .then(minutesPageURI => {
    //     console.log('minutesPageURI:',minutesPageURI);
    //     return Promise.resolve(minutesPageURI)
    // })
}
//========================================
function migrateMeetingDocs(wholePage, groupName, groupLabel, conf) {
    const validExtensions = ['.PDF', '.HTML', '.DOCX', '.DOC', '.ODT']

    var $ = cheerio.load(wholePage);
    const viewAllMinutes = $("#block-system-main > div > div > div > aside > div.region.region-page-sidebar-second.sidebar > div > section.panel-pane.pane-views-panes.pane-group-minutes-panel-pane-1.with-heading > div > div > div > div.more-link")
    const viewAllAgenda  = $("#block-system-main > div > div > div > aside > div.region.region-page-sidebar-second.sidebar > div > section.panel-pane.pane-views-panes.pane-group-agenda-panel-pane-1.with-heading > div > div > div > div.more-link")
    const activeMinutesSelector = "#block-system-main > div > div > div > aside > div > div > section.panel-pane.pane-views-panes.pane-group-minutes-panel-pane-1.with-heading > div > div > div > div > div > ul"
    const activeAgendasSelector = "#block-system-main > div > div > div > aside > div.region.region-page-sidebar-second.sidebar > div > section.panel-pane.pane-views-panes.pane-group-agenda-panel-pane-1.with-heading > div > div > div > div > div > ul"
    // "#block-system-main > div > div > div > aside > div > div > section.panel-pane.pane-views-panes.pane-group-minutes-panel-pane-1.with-heading > div > div > div > div > div > ul"
    let baseLinkToMinutes=null
    let baseLinkToAgendas=null
    if ($(viewAllMinutes).find('a').html()) {
        baseLinkToMinutes = $(viewAllMinutes).find('a').attr('href')
    }
    if ($(viewAllAgenda).find('a').html()) {
        baseLinkToAgendas = $(viewAllAgenda).find('a').attr('href')
    }
    // console.log($(activeMinutesSelector).html());
    const fetchDataFromRow = (row, recordtype) => ({
        uri:expandURI($(row).find($("a")).attr('href')),
        label:$(row).find($("a")).text(),
        date:new Date($(row).find($(".date-display-single")).attr('content')) ,
        groupName: groupName,
        recordtype: recordtype
    })

    // const activeMeetingDocs = $(activeMinutesSelector).children().map( (i, row)  =>  fetchDataFromRow(row,'Minutes')  ).get()
    // .concat($(activeAgendasSelector).children().map( (i, row)  =>  fetchDataFromRow(row, 'Agenda')  ).get())
    //
    // return Promise.all(activeMeetingDocs.map(documentRecord => {
    //     if (! validExtensions.includes(getExtension(documentRecord.uri).toUpperCase())) {
    //         // return fetchFileFromPage(documentRecord.uri, documentRecord, 0, 2)
    //         return fetchFilesFromPage([{uri:documentRecord.uri}], documentRecord, 0, 2)
    //
    //     } else {
    //         return Promise.resolve(Object.assign({}, documentRecord, { uri: documentRecord.uri}))
    //     }
    // }))
    // .then(validFiles => {
    //     const hasLocalFile = (rec) => rec.local
    //     return validFiles.filter(hasLocalFile).map((rec)=> setNewFileName(validExtensions, rec))
    // })
    // .then(withNewFilenames => {
    //     return pushFiles(withNewFilenames)
    //     .then(pushedFiles => {
    //         return Promise.all(
    //             withNewFilenames.map(rec => {
    //                 rec.date = setDefault(rec.date, addDays(new Date(), -21))
    //                 let dbEntry = {pageLink:rec.groupName, recordtype:rec.recordtype ,recorddesc: rec.label, date:rec.date, fileLink:rec.newFilename}
    //                 // console.log('lnk', dbEntry);
    //                 return enterIntoDB(dbEntry)
    //             })
    //         )
    //     })
    // })

    return (baseLinkToMinutes? migrateCurrentMeetingDocs('Minutes',groupName, groupLabel, baseLinkToMinutes+'/2017/', defaultConf.agendaURI): Promise.resolve('NA'))
    .then(meetingMigrateResults => (baseLinkToMinutes? migrateCurrentMeetingDocs('Minutes',groupName, groupLabel, baseLinkToMinutes+'/2016/', defaultConf.minutesURI): Promise.resolve('NA')))
    .then(meetingMigrateResults => (baseLinkToAgendas? migrateCurrentMeetingDocs('Agenda',groupName, groupLabel, baseLinkToAgendas+'/2017/', defaultConf.agendaURI): Promise.resolve('NA')))
    .then(meetingMigrateResults => (baseLinkToAgendas? migrateCurrentMeetingDocs('Agenda',groupName, groupLabel, baseLinkToAgendas+'/2016/', defaultConf.agendaURI): Promise.resolve('NA')))
    .then(meetingMigrateResults => migrateGroupArchivePages(groupName, groupLabel))
    // return migrateGroupArchivePages(groupName, groupLabel)
    .catch(err => {
        console.log('Error fetching '+groupName+' Agendas', err);
    })
    return groupName
}
//========================================
function migrateNewDurhamDepartment(departmentData) {
    console.log('migrateNewDurhamDepartment', departmentData.label);
    let groupName = ''
    let wholePage=""
    // return Promise.resolve(departmentData)
    return cachingFetchURL(departmentData.uri)
    .then(fetchedData => {
        wholePage = fetchedData.data
        groupName = departmentData.label.replace(/ /g,'').replace(/\//g,'_')
    })
    .then(migrateResults => {
        return enterOnlyIntoDBTable('Menus', {pageLink:'/'+groupName, fullLink:'/Departments/'+groupName, description:departmentData.label}, {pageLink:'/'+groupName})
        .then(menuEntryResult =>
            enterOnlyIntoDBTable('Groups', {pageLink:groupName, groupName:groupName, groupDescription:departmentData.label}, {pageLink:groupName})
        )
    })
    .then(migrateResults => migrateMenuLinks(wholePage, Object.assign({},defaultConf, {group:groupName})) )
    .then(migrateResults => migrateGroupContact(wholePage, Object.assign({},defaultConf, {group:groupName})) )
}
//========================================
function migrateNewDurhamBoard_Committee(groupData) {
    console.log('migrateNewDurhamBoard_Committee', groupData.label);
   let wholePage=""

    return cachingFetchURL(groupData.uri)
    .then(fetchedData => {
        wholePage = fetchedData.data
    })
    .then(migrateResults => {
        const groupName = groupData.label.replace(/ /g,'')
        return enterOnlyIntoDBTable('Menus', {pageLink:'/'+groupName, fullLink:'/BoardsAndCommittees/'+groupName, description:groupData.label}, {pageLink:'/'+groupName})
        .then(menuEntryResult =>
            enterOnlyIntoDBTable('Groups', {pageLink:groupName, groupName:groupName, groupDescription:groupData.label}, {pageLink:groupName})
        )
    })
    .then(migrateResults => migrateMenuLinks(wholePage, Object.assign({},defaultConf, {group:groupData.label.replace(/ /g,'')})) )
    .then(migrateResults => migrateDocuments(wholePage, Object.assign({},defaultConf, {group:groupData.label.replace(/ /g,'')})) )
    .then(migrateResults => migrateGroupContact(wholePage, Object.assign({},defaultConf, {group:groupData.label.replace(/ /g,'')})) )
    .then(migrateResults => migrateMeetingDocs(wholePage, groupData.label.replace(/ /g,''), groupData.label, Object.assign({},defaultConf, {group:groupData.label.replace(/ /g,'')})) )
}
//========================================
function migrateNewDurham() {

    return cachingFetchURL('https://www.newdurhamnh.us/boards')
    .then(fetchedData => {
        var $ = cheerio.load(fetchedData.data);
        return $("#block-system-main > div > div > div > table > tbody").children().map( (i, el)  => ({
                addressLines:$(el).find('.views-field-address').text().split('\n').map(line=>line.trim().replace(/  /g,'')).filter(line => line.length > 0),
                contacts: $(el).find('.views-field-field-dept-phone').html().split('<br>').map(line=>line.trim().replace(/  /g,'')),
                label:$(el).find('a').text(),
                uri:expandURI( $(el).find('a').attr('href')),
                // conf: defaultConf,
        }))
        .get()
    })
    .then(allGroupData => {
        return Promise.all(allGroupData.map( migrateNewDurhamBoard_Committee )) //.splice(5,1)
    })
    .then(doneBoards => cachingFetchURL('https://www.newdurhamnh.us/departments'))
    .then(fetchedData => {
        var $ = cheerio.load(fetchedData.data);
        return $("#block-system-main > div > div > div > table > tbody").children().map( (i, el)  => ({
                addressLines:$(el).find('.views-field-address').text().split('\n').map(line=>line.trim().replace(/  /g,'')).filter(line => line.length > 0),
                contacts: $(el).find('.views-field-field-dept-phone').html().split('<br>').map(line=>line.trim().replace(/  /g,'')),
                label:$(el).find('a').text(),
                uri:expandURI( $(el).find('a').attr('href')),
                // conf: defaultConf,
        }))
        .get()
    }).then(departmentData => {
        return Promise.all(departmentData.splice(0,20).map( migrateNewDurhamDepartment )) //.splice(12,1)
    })
    .then(departmentsMigrated => Promise.resolve(departmentsMigrated.length + ' Departments migrated'))
}
//========================================
function migrateFromDataFile() {
    return Promise.all(pageData.map(rec => {
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
    }))

}
//========================================
//========================================
if (require.main === module) {
    process.on('warning', e => console.warn(e.stack));
    process.setMaxListeners(0);

//     let baseRecordData = Object.assign({}, //parsedRecord,
//         {
//             date: Date.now(),
//             groupName:'Planning',
//             recordtype: 'Minutes',
//             label: 'Test Label'
//         })
// fetchFilesFromPage(
//     [{uri:"https://www.newdurhamnh.us/planning-board/minutes/planning-board-minutes-0"}],
//     // [{uri:"https://www.newdurhamnh.us/planning-board/agenda/planning-board-17"}],
//     baseRecordData, 0, 2
// )

    // migrateFromDataFile()
    migrateNewDurham()
    .then(done => {
        console.log('done',require('util').inspect(done, { depth: null }));
        // console.log('done', done);
        process.exit()
    })
    .catch(err => {
        console.log('Error', err);
        process.exit()
    })
}

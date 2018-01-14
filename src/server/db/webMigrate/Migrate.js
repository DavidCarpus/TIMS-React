var fs = require('fs');
var toMarkdown = require('to-markdown');
const crc = require('crc');
var request = require('request');
var URL = require('url-parse');

const cheerio = require('cheerio')
var Config = require('../../config'),
configuration = new Config();
var addDays = require('date-fns/add_days')

var knexConfig = require('../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

var cachingFetchURL = require('./serverIO').cachingFetchURL;
var pullLocalCopies = require('./serverIO').pullLocalCopies;
var pullLocalCopy = require('./serverIO').pullLocalCopy;
var makeServerDirs = require('./serverIO').makeServerDirs;
var getServerFilePath = require('./serverIO').getServerFilePath;
var pullNewServerDirs = require('./serverIO').pullNewServerDirs;
var getSourceServerHost = require('./serverIO').getSourceServerHost;
var pushFileToServer = require('./serverIO').pushFileToServer;
var getRedirectLocation = require('./serverIO').getRedirectLocation;
var extensionFromContentType = require('./serverIO').extensionFromContentType;
var mimeType = require('./serverIO').mimeType;


var enterOnlyIntoTable = require('../../libs/db/common').enterOnlyIntoTable;
var addOrUpdateTable = require('../../libs/db/common').addOrUpdateTable;

var crawler = require('./Crawler').Crawler;

const logFileDateErrors = false

let mergeArrays = (arrays) => [].concat.apply([], arrays)

let defaultConf =     {
    addressSelector:"#block-system-main > div > div > div > aside > div.region.region-page-sidebar-first.sidebar > div > section > div > div > div > div > div",
    phoneSelector:"#block-system-main > div > div > div > aside > div.region.region-page-sidebar-first.sidebar > div > section.panel-pane.pane-views-panes.pane-group-contact-info-contact-info-full.with-heading > div > div > div > div > div > div.field.views--phone > div",
    membersSelector:    "#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article > div > section.inner-node-region > div.view-id-group_board_members > div > table > tbody",
    // "#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article > div > section.inner-node-region > div > div > table > tbody",
    // "#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article > div > section:nth-child(4) > div"
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
        }
    },
    minutesURI: {
        baseArchiveURI: "http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_/",
        currentSelector:"#block-system-main > div > div > div",
        // selector: "body > div > table > tbody > tr:nth-child(2) > td.innerCent > table > tbody",
        extractRecordLabel: (rec) =>  {
            const textBlocks = [["/ np /i"," Non-Public "],["/ np$/i"," Non-Public"],["/nonpublic/i"," Non-Public"],['/Minutes/i',' '],["/.pdf/i",""],["/pdf$/i",""],["/.doc/i",""],["/doc$/i",""],['/  /g',' '],["/Final Approved/i","Approved"]]
            if (rec.groupLabel) { textBlocks.push(["/"+rec.groupLabel+"/i",""]) }
            if (rec.groupAcronym) { textBlocks.push(["/"+rec.groupAcronym+" /i",""]) }
            textBlocks.push(['/^of /',''])
            if (rec.label) { return replaceTextBlocks(rec.label, textBlocks).trim() }
            return labelFromURIText(rec.uri, textBlocks, 'Minutes')
        }
        ,
        getMeetingDate: (rec) => {
            // const textBlocks = [['/Minutes/i',' '],["/.pdf/i",""],["/.doc/i",""],['/  /g',' '],["/Final Approved/i","Approved"]]
            const textBlocks = [["/Minutes/i",""],["/.pdf/i",""],["/.doc/i",""],["/  /g"," "],["/Final Approved/i","Approved"]]
            if (rec.groupAcronym) { textBlocks.push(["/"+rec.groupAcronym+" /i",""]) }
            const retrievedDate = dateFromURIText(replaceTextBlocks(textBlocks), 'Minutes')
            return (retrievedDate !== null) ? retrievedDate: rec.fileDate
        }
    }
}

let logErrors = true
// let logErrors = false

let MIN_VALID_YEAR = 2007
// const years =Array.apply(null, Array((new Date(Date.now())).getUTCFullYear() - 2005+1)).map(function (x, y) { return 2005 + y; });  // [1, 2, 3]

const dateRegExps = [
    // / +(\d?\d)[\. -](\d?\d)[\. -](\d\d\d?\d?)[ .]*/,
    /.*?(PB\D*|pb\D*)-?(\d\d)(\d\d)(\d\d\d?\d?)[ .]*/ ,
    /(\w{2,3})\.?(\d\d)(\d\d)(\d\d)/,
    /(\d?\d)[\. -]{1,2}(\d?\d)[\. -]{1,2}(\d\d\d?\d?)[. ]*/,
    / (\d\d)(\d\d)(\d\d\d\d)[ .]*/ ,
    / +(\d\d)(\d\d)(\d\d)[ .]*/ ,
    /^(\d\d)(\d\d)(\d\d)[ .]*/ ,
    /[ \w]+(\d\d)(\d\d)(\d\d\d\d)[ .]*/ ,
    /(\w{3,}) (\d?\d)[, -]{1,2}(\d\d\d?\d?)[, -]{1,3}(\d?\d):(\d?\d)([ap]+m)/, //With timestamp
    /(\w{3,}) (\d?\d)[, -]{1,2}(\d\d\d?\d?)/,
    /(\w{2,4})[. ]*(\d\d?)[, ]*(\d\d\d?\d?)/,
    /.*?(\d\d)(\d\d)(\d\d)OKmin[ .]*/ ,
    /.*?(\d\d)(\d\d)(\d\d)Dmin[ .]*/ ,
    // /.*?(\d\d)(\d\d)(\d\d)\w*min[ .]*/ ,
    /.*?(\d\d)(\d\d)(\d\d)wsOKmin[ .]*/ ,
    /(\d\d\d\d).(\d\d)(\d\d)/,
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
const makeObjArrayUniq = (objArr, uniqFun) => objArr.reduce( (acc, val) =>{
        const chkFunc = (val2) => uniqFun(val, val2);
        if (acc.findIndex( chkFunc ) < 0) { acc.push(val)};
        return acc;
    },[])

const cleanURI = (uri) => { // Merge references to parent directories
    return uri.replace(/\/[\w]+\/\.\./, '').replace(/\/[\w]+\/\.\./, '').replace(/\/[\w]+\/\.\./, '')
}
//========================================
const fullURIFromHref = (uri, href) => {
    if (uri.indexOf('index.htm') !== -1 && href.indexOf('index.htm') !== -1) {
        debugger
        return uri.substr(0,uri.indexOf('index.htm')) + href
    }

    let uriType =  'unk'
    if (uri.indexOf('http:') !== -1) { uriType =  'http'}
    else if (uri.indexOf('file:') !== -1) { uriType =  'file'}
    else if (uri.startsWith('/:') !== -1) { uriType =  'local'}

    let host ='unk'
    switch (uriType) {
        case 'http':
            host = uri.match(/http:\/\/.*?\//)[0].slice(0,-1)
            return uri.replace(/\?.*/, '') + href
            break;
        case 'file':
            // host = pathWithoutFilename(uri.match(/file:\/\/.*?\//)[0].slice(0,-1))
            host = pathWithoutFilename(uri)
            results = host+'/'+href
            // console.log('fullURIFromHref', '\n', uri, '\n', href, '\n', results);
            return results
            break;
        case 'local':
            host = pathWithoutFilename(uri)+'/'
            return 'file://' + host + href
            break;
        default:
            throw new Error('UriType ' + uriType + ' for ' + uri)
    }
    throw new Error('UriType ' + uriType + ' for ' + uri)
}
//========================================
const strToRegExpObj = (str) =>{
    let search = ''
    let modifiers=''
    try {
        modifiers = str.indexOf('/') >= 0 ? str.replace(/\/.*\//, ""):''
        search = str.indexOf('/') === -1 ? str :
        str.substr(0,str.lastIndexOf('/')).replace('/','').replace(String.fromCharCode(46),String.fromCharCode(92,46))
        return new RegExp(search,modifiers)
    } catch (e) {
        console.log('strToRegExpObj:Error\n', str, '\n', search, '\n', modifiers, '\n',  e);
        throw e
    }
}
//========================================
const replaceTextBlocks = (origStr, replacements) => {
    // console.log('replaceTextBlocks',origStr, '\n', replacements);
    return replacements.reduce( (acc, value) => {
        const val0 = (typeof value[0] === 'string')?strToRegExpObj(value[0]):value[0]
        return acc.replace(val0, value[1])
    }, origStr)
}
//========================================
const removeTextBlocks = (origStr, regExpressionStrings) => {
    return regExpressionStrings.reduce( (acc, value) => {
        return acc.replace(new RegExp(value), '')
    }, origStr)
}
const isNum = (str)=> !isNaN(parseFloat(str)) && isFinite(str);
const monthNumFromStr = (str) => {
    const fnd =
    [
    {str:"JANUARY", num:1},    {str:"FEBRUARY", num:2},
    {str:"MARCH", num:3},    {str:"APRIL", num:4},
    {str:"MAY", num:5},    {str:"JUNE", num:6},
    {str:"JULY", num:7},    {str:"AUGUST", num:8},
    {str:"SEPTEMBER", num:9},    {str:"OCTOBER", num:10},
    {str:"NOVEMBER", num:11},    {str:"DECEMBER", num:12},
    {str:"JAN", num:1},    {str:"FEB", num:2},
    {str:"MAR", num:3},    {str:"APR", num:4},
    {str:"MAY", num:5},    {str:"JUN", num:6},
    {str:"JUL", num:7},    {str:"AUG", num:8},
    {str:"SEPT", num:9},    {str:"OCT", num:10},
    {str:"NOV", num:11},    {str:"DEC", num:12},
    ].filter(elem=>elem.str.toUpperCase() === str.toUpperCase())
    // console.log('fnd', str, fnd);
    if (fnd.length > 0) {
        return fnd[0].num
    }
    return null
}

//========================================
const dateFromURIText = (uri, recType='UNK') => {
    // const yearFromURI = (uri).match(/\/(\d\d\d\d)/)

    const regExpressions = dateRegExps.reduce( (acc, value) => {
        const dateSeq = onlyFileName(uri).match(new RegExp(value))
        // index 0 of 'match' contains the full match (not split)

        if (dateSeq && dateSeq.length >= 4 ) {
            // console.log('seq 1', dateSeq[1]);
            let dateRes=null
            if (isNum(dateSeq[1])) {
                let year=0
                let month=0
                let day=0
                if(Number(dateSeq[1])>31){
                    year =Number(dateSeq[1])
                    month=Number(dateSeq[2])
                    day=Number(dateSeq[3])
                } else {
                    year =Number(dateSeq[3]) < 100? Number(dateSeq[3])+2000: Number(dateSeq[3])
                    month=Number(dateSeq[1])
                    day=Number(dateSeq[2])                 }

                dateRes = new Date(year, month-1, day)
            } else { // We have a month name as str
                // console.log('non num seq 1', dateSeq[1]);
                const month = monthNumFromStr(dateSeq[1])
                if(month !== null){
                    year =Number(dateSeq[3]) < 100? Number(dateSeq[3])+2000: Number(dateSeq[3])
                    if (dateSeq.length > 5) {
                        let hour=Number(dateSeq[4]) + (dateSeq[6]==='pm'?12:0)
                        let minute=dateSeq[5]
                        // console.log('****monthNumFromStr', dateSeq);
                        dateRes = new Date(year, month-1, dateSeq[2], hour, minute)
                    } else {
                        // console.log('****monthNumFromStr', year, dateSeq[1], month, month-1, dateSeq[2]);
                        dateRes = new Date(year, month-1, dateSeq[2])
                    }
                } else if (dateSeq[1].toUpperCase().startsWith('PB') || dateSeq[1].length === 3 || dateSeq[1].length === 2) {
                    // year month day
                    let year=0
                    let month=0
                    let day=0
                    const uppercase = (str) => str.toUpperCase()
                    if(dateSeq[1].toUpperCase().startsWith('PBMINUTES')){
                        month=Number(dateSeq[2])
                        day=Number(dateSeq[3])
                        year =Number(dateSeq[4])
                        // console.log('**** Custom PB Date sequence', dateSeq.slice(1).map(uppercase), month, day, year, '\n\t', uri);
                    } else {
                        year =Number(dateSeq[2])
                        month=Number(dateSeq[3])
                        day=Number(dateSeq[4])
                    }

                    year =year < 100? year+2000: year
                    dateRes = new Date(year, month-1, day)
                }
                // if (month === null) {
                //     dateRes= null
                // }
            }
            //NULL out dateRes if not a valid date
            if (Object.prototype.toString.call(dateRes) === "[object Date]") {
                if ( isNaN( dateRes.getTime() ) ) {
                    // console.log('Reset bad date', uri, dateRes, value);
                    dateRes=null
                }
            } else {
                // console.log('Reset bad date');
                dateRes=null
            }
            if(dateRes && dateRes.getUTCFullYear() > (new Date()).getUTCFullYear()+1) dateRes=null

            if (dateRes !== null ) {
                // console.log('Date regexp match', uri, ' --', value,dateRes);
                acc.push(dateRes)
            }
        }
        return acc
    }, [])
    if (regExpressions.length >= 1) {
        // console.log('dateFromURIText:regExpressions',uri, regExpressions);
        return regExpressions[0]
    }
    // console.log('------------');
    // console.log('**getMeetingDate:' , uri  );
    // console.log('**getMeetingDate:' , onlyFileName(uri)  );

    return null
}
//========================================
const labelFromURIText = (uri, replacements, recType) => {
    // let label=removeTextBlocks(replaceTextBlocks(onlyFileName(uri), replacements.concat(["/"+recType+"/",""])), dateRegExps)
    // let label=removeTextBlocks(replaceTextBlocks(onlyFileName(uri), replacements), dateRegExps)
    let label=replaceTextBlocks(removeTextBlocks(onlyFileName(uri), dateRegExps), replacements )
    .trim().replace(/^-/, '')

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
const logAndRejectDBErr = (dberr) => {
    const errMsg = "DBError:"+ dberr.errorno
    console.error(errMsg);
    return Promise.reject(dberr);
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
    .catch(dberr => logAndRejectDBErr(dberr))
}
//========================================
function enterOnlyIntoDBTable(tableName, record, checkRecord={}){
    return enterOnlyIntoTable(knex,tableName, record, checkRecord)
}
//========================================
const promiseSerial = (funcs) => funcs.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))

//========================================
function sequentiallyAddOrUpdateDBTable(tableName, records){
    const requests = records.map(record=> () => addOrUpdateDBTable(tableName, record.record,record.checkRecord))
    return promiseSerial(requests)
}
//========================================
function addOrUpdateDBTable(tableName, record, checkRecord={}){
    return addOrUpdateTable(knex, tableName, record, checkRecord)
}
//========================================
const enterIntoDB = (record) => enterOnlyIntoDBTable('PublicRecords', record, record)
//=======================================================
function pullLinksFromMenus(pageURI, wholePage, selector) {
    // console.log('pullLinksFromMenus',wholePage.length,selector);
    var $ = cheerio.load(wholePage);
    return $(selector).children().map( (i, el)  => {
        let links = $(el).find('a')
        if (links.length === 0) {
            console.error('Missing link', $(el).html().replace(/\t/g,''));
            return { uri: null, desc: $(el).text().trim(), remotePath:'' }
        }
        return $(links).map( (lnkIndex, linkEl) => {
            let link = $(linkEl).attr('href')
            // let uri = expandURI(link)
            const fullURI=fullURIFromHref(pageURI, link)
            const remotePath = remotePathFromExpandedURI(fullURI)
            return {desc: $(linkEl).text(), uri:fullURI, pageURI:pageURI,remotePath:remotePath, recordtype:'TBD'}
        })
        .toArray()

    }).toArray()

}
//=======================================================
const isDocumentURI = (rec) => rec.remotePath.indexOf('/files/') >= 0 ||
rec.remotePath.indexOf('/uploads/') >= 0 ||
rec.remotePath.indexOf('/stories/') >= 0
//=======================================================
const isRedirectURI = (rec) =>
    !isDocumentURI(rec)
    // rec.remotePath.indexOf('/links/') >= 0 ||
    // rec.remotePath.indexOf('/pages/') >= 0 ||
    // (rec.remotePath.startsWith('http') && rec.remotePath.indexOf( getSourceServerHost()) === -1) // Redirects to existing server

//=======================================================
function pullRedirectLinksFromMenus(pageURI, wholePage, selector) {
    return pullLinksFromMenus(pageURI, wholePage, selector).filter(isRedirectURI).map(
        rec => Object.assign({}, rec, {recordtype: 'Redirect'})
    )
}
//=======================================================
function pullDocumentLinksFromMenus(pageURI, wholePage, selector) {
    return pullLocalCopies(pullLinksFromMenus(pageURI, wholePage, selector).filter(isDocumentURI).map(
        rec => Object.assign({}, rec, {recordtype: 'Document'})
    ))
}
//=======================================================
function migrateDocuments(pageURI, wholePage, conf) {
    const localFileURL = (rec) => 'Documents/' + rec.local.replace(/uploads\//, '').replace(/.*\//,'')

    return pullDocumentLinksFromMenus(pageURI, wholePage, conf.menuLinkSelector)
    .then(documentLinks => {
        // console.log('**migrateDocuments:documentLinks', conf.group, wholePage.length, documentLinks.map(rec=>({uri:rec.uri, local:rec.local})));
        return pullNewServerDirs(getServerFilePath(), ['Documents'] )
        .then( serverDirs => {
            let allPaths= mergeArrays(serverDirs)
            documentLinks = documentLinks.map(
                rec => Object.assign({}, rec, {targetPath: getServerFilePath()+ localFileURL(rec)})
            )

            const notOnServer = (rec) => !allPaths.includes(localFileURL(rec))

            return Promise.all(
                documentLinks.filter(onlyLocalDoc).filter(notOnServer).map(rec => {
                    return pushFileToServer(rec.local, rec.targetPath)
                    .then( pushReq => rec)
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
                .map(rec => enterIntoDB({
                    pageLink:conf.group, recordtype: rec.recordtype ,recorddesc: rec.desc,
                    date:setDefault(rec.date, addDays(new Date(), -21)), fileLink:localFileURL(rec)
                }))
            )
        })
    })
}

//=======================================================
function migrateMenuLinks(pageURI, wholePage, conf) {
    const notEB2Gov = (rec) =>  rec.uri && rec.uri.toUpperCase().indexOf('EB2GOV') === -1
    const notnhtaxkiosk = (rec) =>  rec.uri && rec.uri.toUpperCase().indexOf('NHTAXKIOSK') === -1

    const badLinks = [
        "http://www.newdurhamnh.us/building-inspector/links/assessment-database",
        "https://www.newdurhamnh.us/recreation/links/new-durham-recreation-website",
        "http://www.newdurhamnh.us/recreation/links/new-durham-recreation-website",
        "http://www.newdurhamnh.us/tax-collector/links/online-property-assessments",
        "https://www.newdurhamnh.us/tax-collector/links/online-property-assessments",
    ]

    const links = pullRedirectLinksFromMenus(pageURI, wholePage, conf.menuLinkSelector).filter(link=> badLinks.indexOf(link.uri) === -1)

    // console.log('migrateMenuLinks',links);

    return Promise.all( links.map(linkRec=> Object.assign({}, linkRec,  {uri: linkRec.uri.startsWith('file:')?
        linkRec.uri.replace('file:///home/dcarpus/code/currentSites/', 'http://').replace(/\.html$/,''):
        linkRec.uri})
        )
        .map(getRedirectLocation )
    )
    .then(retrievedURIs => {
        return Promise.all(retrievedURIs.filter(ignoreMailToLink).filter(notEB2Gov).filter(notnhtaxkiosk)
            .map(rec =>  enterIntoDB({
                        pageLink:conf.group, recordtype: 'HelpfulInformation' ,recorddesc: rec.desc,
                        date:setDefault(rec.date, addDays(new Date(), -21)), fileLink:rec.uri
                    }))
        )
    })
}
//========================================
function extractSimpleGroupPageData(wholePage, conf) {
    // console.log('extractSimpleGroupPageData', conf.group);
    var $ = cheerio.load(wholePage);
    let group = {
        contact: {
            pageLink:  conf.group,
            groupName:  conf.group,
        },
        groupName: conf.group,
    }
    if (conf.addressSelector) {
        group.contact.street = $(conf.addressSelector).find('.fn').text().trim() + $(conf.addressSelector).find('.street-address').text().trim()
        group.contact.city = $(conf.addressSelector).find('.locality').text() !== null ? $(conf.addressSelector).find('.locality').text().trim(): ""
        group.contact.postalCode = $(conf.addressSelector).find('.postal-code').text() !== null ? $(conf.addressSelector).find('.postal-code').text().trim(): ""
    }
    if (conf.phoneSelector && $(conf.phoneSelector).html() !== null) {
        group.contact.phone = $(conf.phoneSelector).html().replace(/\t/g,'').replace(/  /g, ' ')
    }
    if (conf.membersSelector) {
        group.members = $(conf.membersSelector).children().map( (i, row)  => {
            const name = $(row).find('.views-field-title').text().replace(/\n/g,'').trim()
            let title = $(row).find('.views-field-field-job-title').text().replace(/\n/g,'').trim()
            const term = title.match(/\((\d*)\)/) ? title.match(/\((\d*)\)/)[1]:""
            title  = title.match(/\((\d*)\)/) ? title.replace(/\((\d*)\)/, "").trim(): title.trim()
            return {name: name, title:title, term:term}
        }).get()

    }

    if (conf.descriptionSelector) {
        const memberHTML= conf.membersSelector? $(conf.membersSelector.match(/^(.+)(>[^>]+){3}$/)[1]).html(): ""
        let descHTML = $(conf.descriptionSelector).html().replace(memberHTML, "").replace(/<h2.*>.*Members.*?<\/h2>/g, '').replace(/<h2.*>\n.*Members.*?<\/h2>/g, '').trim()
        group.descriptionHTML = descHTML
        group.description = toMarkdown(descHTML, { gfm: true })
    }

    return group
}
//========================================
function migrateGroupPageData(wholePage, conf) {
    const firstLastFromFull = (fullName) => ({firstName:fullName.split(' ')[0].trim(), lastName:fullName.split(' ')[1].trim()})
    const groupData = extractSimpleGroupPageData(wholePage, conf)

    return addOrUpdateDBTable('Groups', groupData.contact, {pageLink: groupData.groupName})
    .then(groupData_DB => {
        // console.log('groupData_DB',groupData_DB[0][0]);
        if (!groupData.description) {
            return Promise.resolve('No description data for group' + groupData.groupName)
        }
        return addOrUpdateDBTable('PageText',
            {markdown:groupData.description, html: groupData.descriptionHTML},
            {pageLink: groupData.groupName, sectionName:'desc' }
        )
        .then( pageTextEntered => {
            return sequentiallyAddOrUpdateDBTable('Users', groupData.members.map(member => {
                const user = firstLastFromFull(member.name)
                return {record:user, checkRecord:user}
            }))
            .then(records => {
                return sequentiallyAddOrUpdateDBTable('GroupMembers', groupData.members.map(member => {
                    // console.log('records',records);
                        const user = firstLastFromFull(member.name)
                        const userRec = records.filter(record =>
                             user.firstName === record.firstName && user.lastName===record.lastName
                        )[0]
                        const groupMember = Object.assign({},
                            {userID:userRec.id, groupID:groupData_DB[0].id, office:member.title, term:member.term}
                        )
                        return {record:groupMember, checkRecord:{groupID:groupMember.groupID, userID:groupMember.userID}}
                }))
                return records
            })
        })

    })
}
//========================================
async function getMimeType(uri){
    const result = await mimeType(uri)
    return result
}
//========================================
function getExtensionForFilePath(path){
    // console.log('getExtensionForFilePath',path);
    let extension = getExtension(path)
    if (extension.length > 6) {
        return getMimeType(path)
        .then(fileMimeType => {
            // console.log('fileMimeType',fileMimeType);
            return Promise.resolve(extensionFromContentType(fileMimeType))
        })
    } else {
        return Promise.resolve(extension)
    }
}
//========================================
function setNewFileName(validExtensions, rec) {
    if (!rec.date || typeof rec.date !== 'object') {
        console.error('Date not set for',rec);
        return Promise.reject(('Date not set for'+rec))
    }
    if (!isPhysicalFile(rec)) return Promise.resolve(rec)

    return getExtensionForFilePath(rec.local)
    .then(extension=> {
        if (!validExtensions.includes(extension.toUpperCase())) {
            extension = extensionFromContentType(rec.contentType)
        }
        if (!validExtensions.includes(extension.toUpperCase())) {
            return Promise.reject('UNK extension: "' + extension + '" for\n  ' + require('util').inspect(rec, { depth: null }))
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
            case 'Attachment':
                rec.newFilename = rec.recordtype + '/' + rec.date.getUTCFullYear() + '/'
                rec.newFilename +=  getY_M_D(rec.date)  + '_' + crc.crc32( rec.local).toString(16) + extension
            break;
            default:
                return Promise.reject('***UNK recordtype:' + rec.recordtype + ' for\n  ' + require('util').inspect(rec, { depth: null }))
        }
        rec.newFilename = rec.newFilename.replace(/ /g, '_').replace(/,/g, '_').replace(/__/g, '_')
        return Promise.resolve(rec)
    })
    // .catch(err=> {
    //     console.log(err + rec.uri);
    //     // throw err
    // })
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
        const translatedURI = uri.uri.startsWith('../')?
            cleanURI(pathWithoutFilename(baseRecordData.uri)+'/'+uri.uri) //.replace('../', '/')
            :uri.uri
        // cleanURI()
        // host = pathWithoutFilename(uri)

        // console.log('fetch:',translatedURI);
        return cachingFetchURL(translatedURI)
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
                if (typeof date === 'undefined') { console.error('Unable to determine date for ',translatedURI);}

                const recurseBaseRecordData =  Object.assign({},baseRecordData,{date:new Date(date)})
                return fetchFilesFromPage(links, recurseBaseRecordData, ++currentCnt, maxCnt)
            }
            else {
                // console.log('** urlData',urlData.contentType, currentCnt, translatedURI, urlData.location);
                return Promise.resolve(Object.assign({},baseRecordData,{uri: translatedURI, local:urlData.location }))
            }
        })
    .catch(err=> {
        console.error("Error\n","======");
        console.error(translatedURI);
        console.error("======");
        console.error(linkData, baseRecordData, err);
        return baseRecordData
    })
}))

}
//========================================
function pushFiles(fileRecords) {
    let localPaths=null
    return Promise.all(
        localPaths = fileRecords.filter(rec => rec.date !== 'UNK')
        .map(rec=> pathWithoutFilename(rec.newFilename))
        .filter((v, i, a) => a.indexOf(v) === i)
    )
    .then(localPaths =>
        makeServerDirs(getServerFilePath(), localPaths )
        .then( madeServerDirs =>  pullNewServerDirs(getServerFilePath(), localPaths ))
    )
    .then( serverDirs => {
        let allPaths= mergeArrays(serverDirs)
        // console.log('serverDirs',serverDirs);
        let notOnServer = (rec) => !allPaths.includes(rec.newFilename)

        let withRequiredPaths = fileRecords.map(rec => {
            rec.targetPath = getServerFilePath()+ rec.newFilename
            return rec
        })
        // console.log('withRequiredPaths',withRequiredPaths);
        return Promise.all(
            withRequiredPaths.filter(notOnServer).map(rec => { //.filter(onlyLocalDoc)
                console.log('Push', rec.local, rec.targetPath);
                return pushFileToServer(rec.local, rec.targetPath)
                .then( (pushReq)=> {
                    return rec
                })
                .catch(err => console.log(err, rec))
        }))
        // .then(pushedFiles => {
        //     return withRequiredPaths
        // })
    })
}
//========================================
function migrateCurrentMeetingDocs(recordType, group, groupLabel, uri, conf){
    const validExtensions = ['.PDF', '.HTML', '.DOCX', '.DOC', '.ODT', '.RTF']

    if (!uri.startsWith('http') ) {
        if(!uri.startsWith('/') ) {
            if (!uri.startsWith('file:')) {
                uri = uri + uri
            }
        } else {
            uri = 'http://' + getSourceServerHost() + uri
        }
    }
    if(uri === null) throw new Error('NULL URI')
    return cachingFetchURL(uri)
    .then(urlData => {
        return parseCurrentMeetingDoc(urlData.data,conf.currentSelector)
        .map(meetingDoc => {
            meetingDoc.uri=cleanURI(fullURIFromHref(uri, meetingDoc.uri ))
            return meetingDoc
        })
    })
    .then(parsedAgendas => {
        return Promise.all( parsedAgendas.map(parsedRecord => {
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
                }
            )
            if(validExtensions.includes(getExtension(fullURI).toUpperCase())){
                if(getExtension(fullURI).toUpperCase() !== '.HTML' ){
                    const localPath = fullURI.startsWith('file:///')?fullURI.replace('file://', ''):""
                    return Promise.resolve(Object.assign({}, baseRecordData, { uri: fullURI, local:localPath}))
                } else {
                    // console.log('fetching FilesFrom HTML Page', fullURI);
                    let ff=null
                    return fetchFilesFromPage([{uri:fullURI}], baseRecordData, 0, 2)
                    .then(fetchedFiles=> {
                        ff = fetchedFiles
                        if( fetchedFiles[0].length === 0){
                            console.log('***migrateCurrentMeetingDocs: No attachments on page?',fullURI );
                            return Promise.resolve(Object.assign({}, baseRecordData, { uri: fullURI}))
                        }
                        const fetchedFileURI = fetchedFiles[0][0].uri // Currently only deals with a single file attachment
                        const localPath = fetchedFileURI.startsWith('file:///')?fetchedFileURI.replace('file://', ''):""
                        return Promise.resolve(Object.assign({}, baseRecordData, { uri: fullURI, local:localPath}))
                    })
                    .catch(err=> {
                        console.log('***fetchedFiles err',fullURI, err, ff);
                        return Promise.resolve(Object.assign({}, baseRecordData, { uri: fullURI}))
                    })
                }
            } else {
                const localPath = fullURI.startsWith('file:///')?fullURI.replace('file://', ''):""
                return Promise.resolve(Object.assign({}, baseRecordData, { uri: fullURI, local:localPath}))
            }
        }))
    })
    .then(validFiles => {
        const hasLocalFile = (rec) => rec && rec.local
        return Promise.all(validFiles.reduce( (acc, val) => {
            if (Array.isArray(val[0])) {
                return val[0].reduce( (accElem, valElem) => {
                    return  accElem.concat(valElem)
                }, acc)
            } else {
                return acc.concat(val)
            }
        },[])
        .filter(hasLocalFile).map((rec)=> setNewFileName(validExtensions, rec))
        )
    })
    .then(withNewFilenames => {
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
    .catch(err=>{
        console.log('migrateCurrentMeetingDocs Error', err, uri)
        // throw err
    })
}
//========================================
//========================================
function getGroupArchivesURI(groupName, groupLabel, recordType) {
    // const baseURI = "http://newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/"
    // const indexPageURI = baseURI +"index"
    const baseURI =
    // "file:///home/dcarpus/code/currentSites/newdurhamnharchive.vt-s.net/Pages/NewDurhamNH_Archive/"
    "file:///home/dcarpus/code/currentSites/newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/"

    // "file:///home/dcarpus/code/currentSites/newdurhamnharchive.vt-s.net/Pages/newdurhamnh_archive/"
    // "file:///home/dcarpus/code/currentSites/newdurhamnharchive.vt-s.net/Pages/"
    const indexPageURI = baseURI + 'index.1'
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
function fetchLocalFile(archiveRecord , silent404=false) {
    return cachingFetchURL(archiveRecord.uri)
    .then(urlData =>  Object.assign({},archiveRecord, {local: urlData.location, contentType:urlData.contentType}) )
    .catch(err=> {
        if (  !silent404 && err.toString().indexOf("status code 404") >= 0 ) {
            console.error('fetchLocalFile (err):',err);
        }
        return archiveRecord;
    })
}
//========================================
function migrateGroupArchiveDocument(serverDirs, archiveRecord) {
    let notOnServer = (rec) => !serverDirs.includes(rec.newFilename)

    return cachingFetchURL(archiveRecord.uri)
    .then(urlData => {
        // console.log('Check ', archiveRecord);
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
        let label = badLabels.indexOf(archiveRecord.label) >= 0 ? '':archiveRecord.label
        let dbEntry = {pageLink:archiveRecord.groupName, recordtype:archiveRecord.recordtype ,recorddesc: label, date:archiveRecord.date, fileLink:archiveRecord.newFilename}
        // console.log('migrateGroupArchiveDocument:dbEntry', dbEntry);
        return enterIntoDB(dbEntry)
    })
}
//========================================
async function pullFiles(fileLinksToPull, silent404 = false) {
    let results=[]
    for ( let fileToPull of fileLinksToPull){
        let pulledFile = await fetchLocalFile(fileToPull, silent404)
        results.push(pulledFile)
    }
    return results
}
//========================================
function migrateGroupArchiveDocuments(fileRecordsToMigrate) {
    const serverPaths = fileRecordsToMigrate.reduce( (acc,val) => { return acc.concat(pathWithoutFilename(val.newFilename))}, []).filter(onlyUnique);

    return makeServerDirs(getServerFilePath(), serverPaths )
    .then(dirsMade => pullNewServerDirs(getServerFilePath(), serverPaths ))
    .then( serverDirs => {
        const mergedServerDirs = mergeArrays(serverDirs)
        return Promise.all(fileRecordsToMigrate.map( (rec)=> migrateGroupArchiveDocument(mergedServerDirs,rec)))
    })
}
//========================================
function pullArchiveFiles(groupData, year, pageURI) {
    if (pageURI===null) {   return Promise.resolve([]) }

    return (new crawler()).crawl({uriOnlyFilter:year, noMailLinks:true}, pageURI, pageURI)
    .then(crawledData=> crawledData.filter(rec=> rec.contentType !== 'text/html'))
}
//========================================
function getDateFromFilename(fullPathToFile) {
    return new Promise(function(resolve, reject) {
        fs.stat(fullPathToFile, (err, stats)=> {
            if (err) { reject(err)}
            resolve(new Date(stats.mtime))
        })
    });
}
//========================================
function getDateFromFilenameOrFileDate(rec, getMeetingDate) {
    let date = null
    // if(date === null) date = dateFromURIText(onlyFileName(rec.local))
    if(date === null) date = dateFromURIText(rec.local)
    // if(date === null) date = getDateFromFilename(rec.local)
    return Promise.resolve(date )
}
//========================================
function migrateGroupArchivePages(groupName, groupLabel, conf) {
    // console.log('migrateGrpArchivePages', groupLabel, groupLabel.match(/\b(\w)/g).join(''));
    const startYear = 2007; const endYear=(new Date()).getUTCFullYear();     const years =Array.apply(null, Array(endYear - startYear+1)).map(function (x, y) { return startYear + y; });  // [1, 2, 3]

    const validExtensions = ['.PDF', '.DOC', '.DOCX', '.TIF', '.ZIP', '.RTF']
    const validDateRec = (rec) => rec.date !== null && rec.date < addDays(new Date(),60) && rec.date.getUTCFullYear() >= years[0] && rec.date.getUTCFullYear() <= years[years.length-1]
    const invalidDateRec = (rec) => !validDateRec(rec)
    const logInvalidRecs = (recs, chk) => {
        const invalidDates = recs.filter(chk)
        const msg = (rec)=> logFileDateErrors?'Unable to determine dates from '+ groupName+': ' + rec.uriCRC + '-' + rec.uri.substr(rec.uri.indexOf("_archive")) : ""
        // invalidDates.length > 0 ? console.error( invalidDates.slice(0,10).map(rec=> baseMsg + rec.uri.substr(rec.uri.indexOf("_archive")))) :""
        invalidDates.length > 0 ? console.error( invalidDates.slice(0,10).map(msg)) :""
        return recs
    }
    return Promise.all( years.map(year => {
        return Promise.all(['Minutes', 'Agenda'].map( docType => {
            return getGroupArchivesURI(groupName, groupLabel, docType)
            .then(pageURI =>   pullArchiveFiles({groupName:groupName, groupLabel:groupLabel, docType:docType}, year, pageURI) )
            .then( uniqFileRecords =>  uniqFileRecords.map( rec => Object.assign({},rec,
                {recordtype: docType, groupName:groupName, groupLabel:groupLabel, groupAcronym:groupLabel.match(/\b(\w)/g).join('')}
            ) ) )
            .then( addedTypeInfo =>  pullFiles(addedTypeInfo, false) )
            .then(addDate => Promise.all(addDate.map(rec=>
                getDateFromFilenameOrFileDate(rec, conf.minutesURI.getMeetingDate )
                .then(date => Object.assign({},rec,{date:date}) )
            )))
            .then(logInvalid => logFileDateErrors?logInvalidRecs(logInvalid,invalidDateRec): logInvalid)
            .then(addLabels => Promise.all(addLabels.filter(validDateRec).map(rec=>
                Object.assign({},rec,{label:conf.minutesURI.extractRecordLabel(rec)})
            )))
            .then(addedLabels =>  Promise.all(addedLabels.map((rec)=> setNewFileName(validExtensions, rec))) )
            .then(readyToMigrate => migrateGroupArchiveDocuments(readyToMigrate) )
        }))

    }))
    .then(enteredRecords=> ({groupName:groupName ,cnt:enteredRecords.length}) )
}
//========================================
function logNewsPageData(newsData) {
    const html = newsData.pageText?newsData.pageText.trim() : ""
    let newsEntry = {
        mainpage: true,
        html: html,
        markdown: toMarkdown(html, { gfm: true }),
        pageLink: newsData.pageLink || "",
        summary: newsData.recorddesc,
        datePosted:newsData.date,
        // dateExpires: null
    }
    return enterOnlyIntoDBTable('News', newsEntry, {datePosted: newsEntry.datePosted})
    .then(enteredNewsEntry => {
        return Promise.all(newsData.attachments.map(attachment=>{
            let FileAttachmentsEntry = {
                recordtype: 'news' ,
                parentId:enteredNewsEntry.id,
                fileLink:attachment.newFilename,
                datePosted:newsData.date,
            }
            return enterOnlyIntoDBTable('FileAttachments', FileAttachmentsEntry,
                {datePosted: FileAttachmentsEntry.datePosted, parentId:FileAttachmentsEntry.parentId,}
            )
        }))
    })
    .then((enteredAttachmests)=>{
        // console.log('enteredAttachmests', enteredAttachmests);
        return Promise.resolve(Object.assign({}, newsData, {attachments:enteredAttachmests}))
    })
}
//========================================
function migrateNewsPage(linkRecord) {
    const validExtensions = ['.PDF','.DOCX', '.PNG']
    const postedToDate = (postedStr) => dateFromURIText(postedStr.replace(/.*?:/,'').trim())

    return cachingFetchURL(linkRecord.uri, true && linkRecord.uri.startsWith('http'))
    .then(fetchedData => cheerio.load(fetchedData.data) )
    .then($ =>  {
        const contentDiv = $('#block-system-main > div > div > div > div > div')
        return {recorddesc:$(contentDiv).find(".page-title").text().trim(),
            pageText:$(contentDiv).find(".field-type-text-with-summary").html(),
            date: postedToDate($(contentDiv).find(".submitted").text()),
            attachments: $(contentDiv).find(".field-name-field-file-attachment").length ===0?
                []:
                $(contentDiv).find(".field-name-field-file-attachment").map( (i,row) =>
                    cleanURI(fullURIFromHref(linkRecord.uri,$(row).find('a').attr('href') ))
                ).get()
        }
    })
    .then(parsedData => {
        if (parsedData.attachments.length === 0)  return Promise.resolve(parsedData)

        if (parsedData.attachments.length>0) {
            return Promise.all(parsedData.attachments.map(attachmentHref =>
                cachingFetchURL(attachmentHref)
                .then(fetchedURIData=> Object.assign({}, {
                    local:fetchedURIData.location, recordtype: 'Attachment',
                    date: parsedData.date
                } ) )
                .then(withLocal => setNewFileName(validExtensions, withLocal) )
                .then(withNewFilenames =>
                    makeServerDirs(getServerFilePath(), [pathWithoutFilename(withNewFilenames.newFilename)] )
                    .then( madeServerDirs =>  pullNewServerDirs(getServerFilePath(), [pathWithoutFilename(withNewFilenames.newFilename)] ))
                    .then(serverDirs =>{
                        // console.log('withNewFilenames',withNewFilenames);
                        if (!mergeArrays(serverDirs).includes( withNewFilenames.newFilename)) {
                            return pushFileToServer(withNewFilenames.local, getServerFilePath()+withNewFilenames.newFilename)
                            .then(()=>Promise.resolve(withNewFilenames))
                        } else {
                            return Promise.resolve(withNewFilenames)
                        }
                    })
                )
            ))
            .then(pulledFiles => {
                return Promise.resolve( Object.assign({}, parsedData, {attachments:pulledFiles} ))
            })
        }
    })
    .then(forDB => logNewsPageData(forDB) )
}
//========================================
function migrateNews() {
    const pageURI = "file:///home/dcarpus/code/currentSites/www.newdurhamnh.us/node/1/news.html"
    const selector = "#block-system-main > div > div > div.view-content"

    return cachingFetchURL(pageURI, true && pageURI.startsWith('http'))
    .then(fetchedData => cheerio.load(fetchedData.data) )
    .then($ =>  $(selector).children().map( (i, row)  => ({
                label:$(row).find('a').text(),
                uri:fullURIFromHref(pageURI,$(row).find('a').attr('href')),
            })) .get()
    )
    .then(recs => {
        return Promise.all(recs.map(migrateNewsPage))
    })
}

//========================================
function migrateMeetingDocs(pageURI, wholePage, groupName, groupLabel, conf) {
    var $ = cheerio.load(wholePage);
    const validExtensions = ['.PDF', '.HTML', '.DOCX', '.DOC', '.ODT', '.RTF']
    const viewAllMinutes = $("#block-system-main > div > div > div > aside > div.region.region-page-sidebar-second.sidebar > div > section.panel-pane.pane-views-panes.pane-group-minutes-panel-pane-1.with-heading > div > div > div > div.more-link")
    const viewAllAgenda  = $("#block-system-main > div > div > div > aside > div.region.region-page-sidebar-second.sidebar > div > section.panel-pane.pane-views-panes.pane-group-agenda-panel-pane-1.with-heading > div > div > div > div.more-link")
    const activeMinutesSelector = "#block-system-main > div > div > div > aside > div > div > section.panel-pane.pane-views-panes.pane-group-minutes-panel-pane-1.with-heading > div > div > div > div > div > ul"
    const activeAgendasSelector = "#block-system-main > div > div > div > aside > div.region.region-page-sidebar-second.sidebar > div > section.panel-pane.pane-views-panes.pane-group-agenda-panel-pane-1.with-heading > div > div > div > div > div > ul"

    const trimHTMLFromFileURI = (uri) => (uri.startsWith('file') && uri.endsWith('.html')) ? uri.slice(0, -5): uri
    const addHTMLToFileURI = (uri) => (uri.startsWith('file') && !uri.endsWith('.html')) ? uri+'.html': uri
    const yearURIFromBaseLink = (link, year) => {return link.startsWith('file') ? addHTMLToFileURI(link+'/'+year ) : link+'/'+year +'/'}
    const fetchDataFromRow = (row, recordtype) => ({
        uri:fullURIFromHref(pageURI,$(row).find($("a")).attr('href')),
        label:$(row).find($("a")).text(),
        date:new Date($(row).find($(".date-display-single")).attr('content')) ,
        groupName: groupName,
        recordtype: recordtype
    })

    let baseLinkToMinutes=null
    let baseLinkToAgendas=null
    if ($(viewAllMinutes).find('a').html()) {
        baseLinkToMinutes = trimHTMLFromFileURI(fullURIFromHref(pageURI, $(viewAllMinutes).find('a').attr('href') ))
    }
    if ($(viewAllAgenda).find('a').html()) {
        baseLinkToAgendas = trimHTMLFromFileURI(fullURIFromHref(pageURI, $(viewAllAgenda).find('a').attr('href') ))
    }

    const groupPageMeetingMinutesSelector = "#block-system-main > div > div > div > aside > div.region.region-page-sidebar-second.sidebar > div > section.panel-pane.pane-views-panes.pane-group-minutes-panel-pane-1.with-heading > div > div > div > div.view-content > div > ul"
    const groupPageMeetingAgendaSelector = "#block-system-main > div > div > div > aside > div.region.region-page-sidebar-second.sidebar > div > section.panel-pane.pane-views-panes.pane-group-agenda-panel-pane-1.with-heading > div > div > div > div.view-content > div > ul"

    const groupPageMeetingDocs = $(groupPageMeetingMinutesSelector).children().map( (i, row)  =>  fetchDataFromRow(row,'Minutes')).get()
    .concat($(groupPageMeetingAgendaSelector).children().map( (i, row)  =>  fetchDataFromRow(row, 'Agenda')  ).get())

    const activeMeetingDocs = (baseLinkToMinutes?[]:$(activeMinutesSelector).children().map( (i, row)  =>  fetchDataFromRow(row,'Minutes')  ).get())
    .concat(baseLinkToAgendas?[]:$(activeAgendasSelector).children().map( (i, row)  =>  fetchDataFromRow(row, 'Agenda')  ).get())
    .concat(groupPageMeetingDocs)

    return Promise.all(activeMeetingDocs.map(documentRecord => {
        if (! validExtensions.includes(getExtension(documentRecord.uri).toUpperCase())) {
            return fetchFilesFromPage([{uri:documentRecord.uri}], documentRecord, 0, 2)
        } else {
            return Promise.resolve([Object.assign({}, documentRecord, { uri: documentRecord.uri})])
        }
    }))
    .then(validFiles => {
        const hasLocalFile = (rec) => rec && rec.local
        return Promise.all (validFiles.reduce( (acc, val) => {
            if (Array.isArray(val[0])) {
                return val[0].reduce( (fileAcc, fileVal)=> {
                    return fileAcc.concat(fileVal)
                }, acc)
            } else {
                return acc.concat(val)
            }
        },[])
        .filter(hasLocalFile).map((rec)=> setNewFileName(validExtensions, rec))
        )
    })
    .then(withNewFilenames => {
        return pushFiles(withNewFilenames)
        .then(pushedFiles => {
            return Promise.all(
                withNewFilenames.map(rec => {
                    let dbEntry = {pageLink:rec.groupName, recordtype:rec.recordtype ,recorddesc: rec.label,
                        date:setDefault(rec.date, addDays(new Date(), -21)), fileLink:rec.newFilename}
                    return enterIntoDB(dbEntry)
                })
            )
        })
    })
    .then(meetingMigrateResults => {
        const pullRecents = (docType, baseLink) => {
            if(!baseLink) return Promise.resolve('NA')
            // console.log('pull' + docType + ':',baseLink);
            return cachingFetchURL(baseLink)
            .then(fetchedData => {
                $ =cheerio.load(fetchedData.data)
                return Promise.resolve( $("#block-system-main > div > div > div > div > ul").children()
                .map( (i, el)  =>  fullURIFromHref(baseLink , $(el).find('a').attr('href'))).get())
            })
            .then(links => Promise.all(links.map(pageLink=>
                migrateCurrentMeetingDocs(docType,groupName, groupLabel, pageLink, defaultConf.minutesURI)
            )))
        }
        return pullRecents('Minutes', baseLinkToMinutes)
        .then(meetingMigrateResults =>  pullRecents('Agenda', baseLinkToAgendas))
        .then(meetingMigrateResults => migrateGroupArchivePages(groupName, groupLabel, conf))
    })
    .catch(err => {
        console.log('Error fetching '+groupName+' Agendas', err);
    })
}
//========================================
function migrateNewDurhamDepartment(departmentData) {
    // console.log('migrateNewDurhamDepartment', departmentData.label);
    let wholePage=""

    return cachingFetchURL(departmentData.uri)
    .then(fetchedData => {
        wholePage = fetchedData.data
    })
    .then(migrateResults => {
        const groupName = departmentData.label.replace(/ /g,'').replace(/\//g,'_')
        // console.log('migrateNewDurhamDepartment', groupName);
        return enterOnlyIntoDBTable('Menus', {pageLink:'/'+groupName, fullLink:'/Departments/'+groupName, description:departmentData.label}, {pageLink:'/'+groupName})
        .then(menuEntryResult =>
            enterOnlyIntoDBTable('Groups', {pageLink:groupName, groupName:groupName, groupDescription:departmentData.label}, {pageLink:groupName})
        )
    })
    // .then(migrateResults => migrateMenuLinks(departmentData.uri, wholePage, Object.assign({},defaultConf, {group:departmentData.label.replace(/ /g,'').replace(/\//g,'_')})) )
    .then(migrateResults => migrateGroupPageData(wholePage, Object.assign({},defaultConf, {group:departmentData.label.replace(/ /g,'').replace(/\//g,'_')})) )
}
//========================================
function migrateNewDurhamBoard_Committee(groupData) {
   let wholePage=""

    return cachingFetchURL(groupData.uri, true && groupData.uri.startsWith('http'))
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
    .then(migrateResults => migrateMenuLinks(groupData.uri, wholePage, Object.assign({},defaultConf, {group:groupData.label.replace(/ /g,'')})) )
    .then(migrateResults => migrateGroupPageData(wholePage, Object.assign({},defaultConf, {group:groupData.label.replace(/ /g,'')})) )
    .then(migrateResults => migrateDocuments(groupData.uri, wholePage, Object.assign({},defaultConf, {group:groupData.label.replace(/ /g,'')})) )
    .then(migrateResults => migrateMeetingDocs(groupData.uri, wholePage, groupData.label.replace(/ /g,''), groupData.label, Object.assign({},defaultConf, {group:groupData.label.replace(/ /g,'')})) )
}
//========================================
function migrateNewDurham() {
    const dataFromElement = (rootURI, el) => {
        return {
            addressLines:el.find('.views-field-address').text().split('\n').map(line=>line.trim().replace(/  /g,'')).filter(line => line.length > 0),
            contacts: el.find('.views-field-field-dept-phone').html().split('<br>').map(line=>line.trim().replace(/  /g,'')),
            label:el.find('a').text(),
            // uri:expandURI( el.find('a').attr('href')),
            // href:rootURI+el.find('a').attr('href'),
            uri:fullURIFromHref(rootURI,el.find('a').attr('href')),
            // href:fullURIFromHref(rootURI,el.find('a').attr('href')),
        }
    }

    return cachingFetchURL('https://www.newdurhamnh.us/boards')
    .then(fetchedData => {
        var $ = cheerio.load(fetchedData.data);
        return $("#block-system-main > div > div > div > table > tbody").children().map( (i, el)  => {
            return dataFromElement(fetchedData.location, $(el))
        }).get()
        // .splice(0,7)
    })
    .then(allGroupData =>  {
        // console.log('allGroupData',allGroupData);
        return Promise.all(allGroupData.map( migrateNewDurhamBoard_Committee )) // .splice(0,1)
    }) //.splice(5,1)
    .then(committeesMigrated => console.log(committeesMigrated.length + ' committees migrated') && Promise.resolve(committeesMigrated))

    .then(doneBoards => cachingFetchURL('https://www.newdurhamnh.us/departments'))
    .then(fetchedData => {
        var $ = cheerio.load(fetchedData.data);
        return $("#block-system-main > div > div > div > table > tbody").children().map( (i, el)  => {
            // console.log('el', $(el).html());
            return dataFromElement(fetchedData.location, $(el))
        }).get()
        // .splice(1,1)
    })
    .then(departmentData => Promise.all(departmentData.map( migrateNewDurhamDepartment ))    ) //.splice(12,1)
    .then(departmentsMigrated => {
        console.log(departmentsMigrated.length + ' Departments migrated')
    })
    .then( ()=>migrateNews())
    .then( (newsItems)=>{
        console.log('newsItems migrated', newsItems.length);
    })
}
//========================================
if (require.main === module) {
    process.on('warning', e => console.warn(e.stack));
    process.setMaxListeners(0);

    // migrateFromDataFile()
    // migrateGroupArchivePages("BoardofSelectmen", "Board of Selectmen")
    // const uri = "file:///home/dcarpus/code/currentSites/newdurhamnharchive.vt-s.net/Pages/NewDurhamNH_Archive/NewDurhamNH_BOSMin/2007%20BOS%20MINUTES/index.html"
    const uri = "file:///home/dcarpus/code/currentSites/newdurhamnharchive.vt-s.net/pages/newdurhamnh_archive/NewDurhamNH_BOSMin/2007%20BOS%20MINUTES/index.html"
    migrateNewDurham()
    // migrateNews()
    // crawler(uri)
    .then(done => {
        // console.log('done', Object.keys(done).length, require('util').inspect(done, { depth: null }));
        console.log('done', require('util').inspect(done, { depth: null }));
        // console.log(done.filter(item=>item.uri.endsWith('pdf')).length);
        // console.log('done', done.filter(item=>!item.uri.endsWith('pdf')));
        // console.log('done', Object.keys(done).length, );
        process.exit()
    })
    .catch(err => {
        console.log('Error', err);
        process.exit()
    })
}

var Config = require('../server/config');
configuration = new Config();

const onlyUnique = (value, index, self) => self.indexOf(value) === index;
const cleanURI = (uri) => { // Merge references to parent directories
    return uri.replace(/\/[^\/]+\/\.\./, '').replace(/\/[^\/]+\/\.\./, '').replace(/\/[^\/]+\/\.\./, '')
}

const fullPathFromLink = (link) => {
    if(link === null) return link
    let fullPath = link;
    if (!fullPath.startsWith('http')) {
        fullPath = configuration.PRIVATE_DIR + '/Attachments/' + fullPath
    }
    return cleanURI(fullPath)
}
//=================================================
function logGroupDocumentRecord(knexConnection, entry) {
    return logPublicRecordInsertOnly(knexConnection, entry)
}
//=================================================
function logHelpfulInformationRecord(knexConnection, entry) {
    return logPublicRecordInsertOnly(knexConnection, entry)
}
//=================================================
function logPublicRecordInsertOnly(knexConnection, entry) {
    // console.log('logPublicRecordInsertOnly',entry);
    return knexConnection('PublicRecords').select('*').where({fileLink:entry.fileLink})
    .then(results => {
        if (results.length === 0) {
            // console.log('logPublicRecordInsertOnly:Inserting.',entry);
            return knexConnection("PublicRecords").insert(entry)
            .then(results => {
                entry.id = results[0];
                return Promise.resolve(entry);
            })
            .catch(err => {
                return Promise.reject(err);
            })
        } else {
            // console.log('logPublicRecordInsertOnly:Already exists.',entry);
            entry.id = results[0];
            return Promise.resolve(entry);
        }
    })
}
//=================================================
function getPublicDocDataWithAttachments(dbConn, keyField = "PublicRecords", key) {
    let query=null
    const fieldList = [
        'PublicRecords.*', 'PageText.html', "Groups.groupDescription",
        'FileAttachments.fileLink as attachmentLink', 'FileAttachments.id as attachmentID'
    ]
    switch (keyField) {
        case "PublicRecords":
            query = dbConn('PublicRecords')
            .leftJoin('PageText','PageText.id', 'PublicRecords.PageTextID')
            .leftJoin('FileAttachments','PublicRecords.id', 'FileAttachments.parentId')
            .leftJoin('Groups','PublicRecords.pageLink', 'Groups.pageLink')
            .select( fieldList)
            .where({'PublicRecords.id':key})
            break;
        case "FileAttachments":
            query =  dbConn('FileAttachments')
            .leftJoin('PublicRecords','PublicRecords.id', 'FileAttachments.parentId')
            .leftJoin('PageText','PageText.id', 'FileAttachments.parentId')
            .leftJoin('Groups','PublicRecords.pageLink', 'Groups.pageLink')
            .select( fieldList)
            .where({'FileAttachments.id':key})
            break;
        case "GroupName":
            query =  dbConn('Groups')
            .leftJoin('PublicRecords','PublicRecords.pageLink', 'Groups.pageLink')
            .leftJoin('PageText','PageText.id', 'PublicRecords.PageTextID')
            .leftJoin('FileAttachments','PublicRecords.id', 'FileAttachments.parentId')
            .select( fieldList)
            .where({'Groups.pageLink':key})
            break;
        default:

    }
    // console.log('query', query.toString());
    const addAttachmentRecord =(acc, val)=> val.attachmentID<=0 || val.fileLink
    ? acc:
        Object.assign(acc,  {attachments:acc.attachments.concat(
            {fileLink:fullPathFromLink(val.attachmentLink), id:val.attachmentID}
        )})
    return query.then(dbRecords =>{
        const db2 = dbRecords.map(rec=> rec.id).filter(onlyUnique)
        .map(id=> dbRecords.filter(rec=>rec.id === id).map(meta => ({
            id:meta.id, recorddesc:meta.recorddesc, recordtype:meta.recordtype, datePosted:meta.date,
            html:meta.html, groupDescription:meta.groupDescription,
            fileLink:fullPathFromLink(meta.fileLink), attachments:[]
        }))[0] )
        return db2.map(rec => {
            return Object.assign( rec, {
                attachments: dbRecords.filter(origRec=> origRec.id === rec.id && origRec.attachmentID !== null)
                .map(rec=> ({ id:rec.attachmentID, fileLink:fullPathFromLink(rec.attachmentLink)}) )
            })
        } )
    })
}

//=================================================
function getGroupMeetingDocuments(dbConn, groupName) {
    const fieldList = ['id','recordtype as type','fileLink as link','date','recorddesc as description']
    const query =  dbConn('PublicRecords')
    .select( fieldList)
    .where({'pageLink':groupName})
    .andWhere( function () {
        this.where({recordtype:'Minutes'})
        .orWhere({recordtype:'Agenda'})
        .orWhere({recordtype:'Video'})
        .orWhere({recordtype:'Decision'})
    })
    .andWhere( function () {
        this.whereNull('expiredate').orWhere('expiredate', '>' , new Date())
    })
    .orderBy(["date", "recordtype"])

    return query
    .then(rows => rows.reduce( (newArray, row) => {
            let key = row.date;
            delete row.date;
            (newArray[key] = newArray[key] || []).push(row);
            return newArray;
        }, {})
    )
}
//=================================================
function getPublicDocData(dbConn, id) {
    return getPublicDocDataWithAttachments(dbConn, "PublicRecords", id)
}
//=================================================
function getFileData(dbConn, id) {
    return getPublicDocDataWithAttachments(dbConn, "FileAttachments", id)
}
//=================================================
function getRecordYearRange(records, keyField) {
    const years = records.map(record=> (new Date(record[keyField])).getUTCFullYear() ).filter(onlyUnique)
    return years.length > 1? years.slice(0,years.length): [years[0], years[0]]
}

function fetchYearFilteredPublicDocs(knex, filter) {
    return fetchPublicDocsFromDB(knex, filter, rawFilter)
}

function fetchPublicDocsTypes(knex) {
    return knex('PublicRecords').distinct("recordtype").select()
    .then(results=> results.map(rec=>rec.recordtype) )
}

function fetchPublicDocsGroups(knex) {
    return knex('PublicRecords')
    .leftJoin('Groups','Groups.pageLink', 'PublicRecords.pageLink')
    .distinct(["Groups.pageLink", "Groups.groupDescription  as description"])
    .orderBy("Groups.groupDescription")
}

function fetchPublicDocsYearRange(knex) {
    return knex('PublicRecords').min( 'date as min').max( 'date as max').whereNotNull('fileLink')
    .then(results=> [results[0].min, results[0].max] )
}

function fetchPublicDocsDataFromDB(knex, filter, limit=50) {
    return fetchPublicDocsFromDB(knex, filter)
    .then(records => fetchPublicDocsYearRange(knex)
        .then(range=> Object.assign({},
            {records:records.slice(0,limit)},
            {meta:{
                dateRange:range,
                recordCount:records.length,
                limit:limit
            }},
        ) )
    )
    .then( (recordData)=> fetchPublicDocsTypes(knex)
        .then(types => Object.assign({}, recordData, {types:types} ) ) )
    .then( (recordData)=> fetchPublicDocsGroups(knex)
        .then(groups => Object.assign({}, recordData, {groups:groups} ) ) )
}

function fetchPublicRecordPage(knex, pageURI) {
    return knex('PublicRecords')
    .select( ['PublicRecords.id','date','Groups.groupDescription','PublicRecords.recorddesc', 'PageText.html'])
    .leftJoin('Groups','Groups.groupName', 'PublicRecords.pageLink')
    .leftJoin('PageText','PageText.id', 'PublicRecords.pageTextID')
    .where({filelink:"/"+pageURI, recordtype:'page'})
    .then( (recordData)=>
        Object.assign({}, recordData[0],
            {html:makeHrefsOpenNew(recordData[0].html)}
        )
    )
}

function fetchPublicDocsFromDB(knex, filter) {
    if(filter.recordType) filter.recordType= normalizeRecordType(filter.recordType)
    if(filter.pageLink) filter["PublicRecords.pageLink"]= filter.pageLink
    delete filter.pageLink
    let rawFilter = ""
    if(filter.year) rawFilter = "YEAR(date) = "+filter.year
    delete filter.year

    const query =  knex('PublicRecords')
    .select( ['PublicRecords.id','recordtype as type','fileLink as link','date','PublicRecords.pageLink as groupName','Groups.groupDescription','PublicRecords.recorddesc'])
    .leftJoin('Groups','Groups.groupName', 'PublicRecords.pageLink')
    .where(filter)
    .whereRaw(rawFilter)
    .orderBy("date","desc")
    .orderBy("recordtype")

    // console.log('query', query.toString());
    return query
}

function normalizeRecordType(recordType) {
    console.log('normalizeRecordType:', recordType);
    switch (recordType.toUpperCase()) {
        case 'NOTICES':
        case 'NOTICE':
            return 'Notice'
        break;
        case 'AGENDAS':
        case 'AGENDA':
            return 'Agenda'
            break;
        case 'MINUTES':
        case 'MINUTE':
            return 'Minutes'
            break;
        case 'DOCUMENTS':
        case 'DOCUMENT':
            return 'Document'
            break;
        case 'RFPS':
        case 'RFP':
            return 'RFP'
            break;
        case 'news':
        case 'News':
            return 'News'
            break;
        case 'VOTING':
            return 'Voting'
            break;
        default:
            return recordType
    }

}
function addAPIPrefixToFetchFileHref(html) {
    return html.replace(new RegExp(/href="fetchfile\//,'g'),'href="/api/fetchfile/')
}

function makeHrefsOpenNew(html) {
    const links = html.match(new RegExp(/(<a.*>.*<\/a>)/,'g'))
    if(links === null || links.length === 0) return html
    return links.reduce( (acc,val) => {
        return acc.replace(val, val.replace(/ href=/, " target='_blank' href=" ))
    },html);
}

if (require.main === module) {
    var knexConfig = require('../server/libs/db/knexfile.js')
    var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

    // fetchPublicRecordPage(knex, 'cemetery-fees')
    // fetchPublicDocsDataFromDB(knex, {recordType:'News'}, 100)
    // getPublicDocData(knex, 3383) // 3383 , 3374, 115 , 3395, 115
//    getPublicDocDataWithAttachments(knex, 'GroupName', 'TransferStation') // BoardofSelectmen , TransferStation
    // getPublicDocDataWithAttachments(knex, 'FileAttachments', 165) // BoardofSelectmen , TransferStation
    // getFileData(knex, 2)
    getGroupMeetingDocuments(knex, "BudgetCommittee")
    .then( (results) => {
        console.log('Done: publicDocs test:', require('util').inspect(results, { depth: null }));
        // console.log(addAPIPrefixToFetchFileHref(makeHrefsOpenNew(results.html)));
    })
    .then( ()=>process.exit() )
}

// module.exports.normalizeRecordType = normalizeRecordType;
// module.exports.fetchPublicDocsYearRange = fetchPublicDocsYearRange;
module.exports.fetchPublicDocsDataFromDB = fetchPublicDocsDataFromDB;
module.exports.fetchPublicRecordPage = fetchPublicRecordPage;
module.exports.getPublicDocData = getPublicDocData;
module.exports.getPublicDocDataWithAttachments = getPublicDocDataWithAttachments;
module.exports.getGroupMeetingDocuments = getGroupMeetingDocuments;
module.exports.logGroupDocumentRecord = logGroupDocumentRecord;
module.exports.logHelpfulInformationRecord = logHelpfulInformationRecord;

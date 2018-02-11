var Config = require('../server/config');
configuration = new Config();

const onlyUnique = (value, index, self) => self.indexOf(value) === index;
const cleanURI = (uri) => { // Merge references to parent directories
    return uri.replace(/\/[^\/]+\/\.\./, '').replace(/\/[^\/]+\/\.\./, '').replace(/\/[^\/]+\/\.\./, '')
}

const fullPathFormLink = (link) => {
    if(link === null) return link
    let fullPath = link;
    if (!fullPath.startsWith('http')) {
        let attachmentPath= configuration.PRIVATE_DIR + '/Attachments/'
        fullPath = attachmentPath + fullPath
    }
    return cleanURI(fullPath)
}
//=================================================
function getPublicDocData(dbConn, id) {
    return dbConn('PublicRecords')
    .leftJoin('FileAttachments','PublicRecords.id', 'FileAttachments.parentId')
    .select( [
        'PublicRecords.*',
    'FileAttachments.fileLink as attachmentLink', 'FileAttachments.id as attachmentID'
    ])
    .where({'PublicRecords.id':id})
    .then(dbRecords => {
        return dbRecords.reduce( (acc,val)=>
            val.attachmentID>0?
            Object.assign(acc,  {attachments:acc.attachments.concat(
                {fileLink:fullPathFormLink(val.attachmentLink), id:val.attachmentID}
            )})
            :acc
        , {
            id:dbRecords[0].id,
            recorddesc:dbRecords[0].recorddesc,
            recordtype:dbRecords[0].recordtype,
            fileLink:fullPathFormLink(dbRecords[0].fileLink),
            datePosted:dbRecords[0].date,
            attachments:[]
        })
    })
}
//=================================================
function getFileData(dbConn, id) {
    return dbConn('FileAttachments')
    .select( ['FileAttachments.id','FileAttachments.fileLink as type','fileLink as link','FileAttachments.recorddesc'])
    .where({id:id})
}

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

    return knex('PublicRecords')
    .select( ['PublicRecords.id','recordtype as type','fileLink as link','date','PublicRecords.pageLink as groupName','Groups.groupDescription','PublicRecords.recorddesc'])
    .leftJoin('Groups','Groups.groupName', 'PublicRecords.pageLink')
    .where(filter)
    .whereRaw(rawFilter)
    .orderBy("date","desc")
    .orderBy("recordtype")
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
    getPublicDocData(knex, 3383)
    .then( (results) => {
        console.log('Done: fetchPublicDocs', results )
        // console.log(addAPIPrefixToFetchFileHref(makeHrefsOpenNew(results.html)));
    })
    .then( ()=>process.exit() )
}

// module.exports.normalizeRecordType = normalizeRecordType;
// module.exports.fetchPublicDocsYearRange = fetchPublicDocsYearRange;
module.exports.fetchPublicDocsDataFromDB = fetchPublicDocsDataFromDB;
module.exports.fetchPublicRecordPage = fetchPublicRecordPage;
module.exports.getPublicDocData = getPublicDocData;

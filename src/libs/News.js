
//================================================
function pullNewsListForGroup(dbConn, groupName) {
    return dbConn('PublicRecords')
    .select([
        "PublicRecords.id", "PublicRecords.recorddesc as summary", "PublicRecords.date as datePosted",
        "PublicRecords.expiredate as dateExpires", "PublicRecords.pageLink",
    ])
    .orderBy("datePosted", "desc")
    .where((groupName == 'Home')? { mainpage:1}: {pageLink:groupName})
    .andWhere( {recordtype:'news'})
    .andWhere( function () {
        this.whereNull('expiredate').orWhere('expiredate', '>' , new Date())
    })
}
//================================================
function pullNewsDetailsWithAttachmentMeta(dbConn, id) {

    return dbConn('PublicRecords')
    .leftJoin('FileAttachments','FileAttachments.parentId', 'PublicRecords.id')
    .leftJoin('PageText','PageText.Id', 'PublicRecords.pageTextID')
    .select([
        "PublicRecords.id", "PublicRecords.recorddesc as summary", "PageText.html",
        "PublicRecords.date as datePosted", "PublicRecords.expiredate as dateExpires", "PublicRecords.pageLink",
        'FileAttachments.fileLink', 'FileAttachments.recorddesc', 'FileAttachments.id as attachmentID'
    ])
    .orderBy("FileAttachments.datePosted")
    .where({"PublicRecords.id":id})
    .then(dbRecords => {
        return dbRecords.reduce( (acc,val)=>
            val.attachmentID>0?
            Object.assign(acc,  {attachments:acc.attachments.concat({fileLink:val.fileLink, id:val.attachmentID})})
            :acc
        , {
            id:dbRecords[0].id,
            summary:dbRecords[0].summary,
            html:dbRecords[0].html,
            datePosted:dbRecords[0].datePosted,
            attachments:[]
        })
    })
}
//================================================
if (require.main === module) {
    var knexConfig = require('../server/libs/db/knexfile.js')
    var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

    pullNewsDetailsWithAttachmentMeta(knex, 22)
    // pullNewsListForGroup(knex, 'Home')
    .then( (results) => {
        console.log(results);
    })
    .then( ()=>process.exit() )
}
//================================================
module.exports.pullNewsDetailsWithAttachmentMeta = pullNewsDetailsWithAttachmentMeta;
module.exports.pullNewsListForGroup = pullNewsListForGroup;

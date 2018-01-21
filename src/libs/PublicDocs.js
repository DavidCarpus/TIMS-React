// var addHours = require( 'date-fns/add_hours');
// var isSameDay = require( 'date-fns/is_same_day');

function fetchPublicDocs(knex, filter) {
    if(filter.recordType) filter.recordType= normalizeRecordType(filter.recordType)
    console.log('fetchPublicDocs:', filter );
    // query = "Select id, recordtype as type, fileLink as link,DATE_FORMAT(date,'%m/%d/%Y') as date from PublicRecords where pageLink='" + req.params.recordtype +"'";

    return knex('PublicRecords')
    .select( ['PublicRecords.id','recordtype as type','fileLink as link','date','PublicRecords.pageLink as groupName','Groups.groupDescription','PublicRecords.recorddesc'])
    .leftJoin('Groups','Groups.groupName', 'PublicRecords.pageLink')
    .where(filter)
    .whereNotNull('fileLink')
    .orderBy(["date", "recordtype"])
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
        case 'VOTING':
            return 'Voting'
            break;
        default:
    }

}

if (require.main === module) {
    var knexConfig = require('../server/libs/db/knexfile.js')
    var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

    const filter = {recordType:'Document', "PublicRecords.pageLink":"BoardofSelectmen"}
    fetchPublicDocs(knex, filter)
    .then( (results) => {
        console.log('Done: fetchPublicDocs', results);
        process.exit()
    })
}

module.exports.normalizeRecordType = normalizeRecordType;
module.exports.fetchPublicDocs = fetchPublicDocs;

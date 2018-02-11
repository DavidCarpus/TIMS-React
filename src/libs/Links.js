//================================================
function pullMenuLinks(dbConn) {
    return dbConn('Menus').select(["description","pageLink", "fullLink as link"])
    .then(data => data.map(row=> ({desc: row.description, link:row.link}) ) )
}
//================================================
function pullHelpfulLinksFromPublicRecords(dbConn) {
    return dbConn('PublicRecords').select(["recorddesc as description","pageLink", "fileLink as link"])
    .where({'recordtype': 'HelpfulInformation'})
    .then(data => data.map(row=> ({desc: row.description, link:row.link}) ) )
}
//================================================
function pullHelpfulLinksFromListData(dbConn) {
    return dbConn('ListData').select(["datadesc as description","fileLink as link"])
    .where({'listName': 'HelpfulLinks'})
    .then(data => data.map(row=> ({desc: row.description, link:row.link}) ) )
}
//================================================
function pullLinksFromDB(dbConn) {
    return pullHelpfulLinksFromListData(dbConn)
    .then(listData =>
        pullHelpfulLinksFromPublicRecords(dbConn)
        .then(publicRecords=>
            pullMenuLinks(dbConn)
            .then(menuLinks=>
                listData.concat(publicRecords).concat(menuLinks)
            )
        )
    )
}
//================================================
if (require.main === module) {
    var knexConfig = require('../server/libs/db/knexfile.js')
    var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

    pullLinksFromDB(knex)
    .then( (results) => {
        console.log('results', require('util').inspect(results, { depth: null }));
    })
    .then( ()=>process.exit() )
}
//================================================
module.exports.pullLinksFromDB = pullLinksFromDB;

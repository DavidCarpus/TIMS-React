
//================================================
function pullGroupData(dbConn, groupName) {
    return pullGroupPageText(dbConn, groupName)
    .then(pageText =>
        pullGroupMembers(dbConn, groupName)
        .then(members =>
            pullWasteTypes(dbConn, groupName)
            .then(wasteTypes =>
                pullHelpfulInformationForGroup(dbConn, groupName)
                .then(helpfulInformation =>
                    Object.assign({}, {members:members, pagetext:pageText, wasteTypes:wasteTypes, helpfulinformation:helpfulInformation} )
                )
            )
        )
    )
}

//================================================
function pullHelpfulInformationForGroup(dbConn, groupName) {
    const fieldList = ["id","recorddesc as description", "fileLink" ]
    return  dbConn('PublicRecords')
    .select( fieldList)
    .where( (groupName == 'Home')? { mainpage:1}: {'PublicRecords.pageLink':groupName} )
    .andWhere( function () {
        this.where({recordtype:'HelpfulInformation'})
        .orWhere({recordtype:'Page'})
    })
}
//================================================
function pullWasteTypes(dbConn, groupName) {
    const fieldList = ["id","datatext as wasteType", ]
    return  dbConn('ListData')
    .select( fieldList)
    .where({'ListData.pageLink':groupName})
    .andWhere({'ListData.listName':'WasteTypes'})
}

//================================================
function pullGroupPageText(dbConn, groupName) {
    const fieldList = ["PageText.sectionName",   "groupDescription as description", "PageText.html", ]
    return  dbConn('Groups')
    .leftJoin('PageText','PageText.pageLink', 'Groups.pageLink')
    .select( fieldList)
    .where({'Groups.pageLink':groupName})
    .andWhere( function () {
        this.where({sectionName:'text1'})
        .orWhere({sectionName:'desc'})
    })
}

//================================================
function pullGroupMembers(dbConn, groupName) {
    const fieldList = ["GroupMembers.id","firstName" , "lastName","term","Users.phone"," Users.emailAddress as email"," GroupMembers.office"]
    return  dbConn('GroupMembers')
    .leftJoin('Groups','GroupMembers.groupID', 'Groups.id')
    .leftJoin('Users','GroupMembers.userID', 'Users.id')
    .select( fieldList)
    .where({'Groups.pageLink':groupName})
}

//================================================
if (require.main === module) {
    var knexConfig = require('../server/libs/db/knexfile.js')
    var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

    pullGroupData(knex, 'BoardofSelectmen')
    // pullWasteTypes(knex, 'TransferStation')
    // pullHelpfulInformationForGroup(knex, 'BoardofSelectmen')
    .then( (results) => {
        console.log('results', require('util').inspect(results, { depth: null }));
    })
    .then( ()=>process.exit() )
}
//================================================
module.exports.pullGroupData = pullGroupData;

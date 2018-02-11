
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
    const query =  dbConn('PublicRecords')
    .select( fieldList)
    .where( (groupName == 'Home')? { mainpage:1}: {'PublicRecords.pageLink':groupName} )
    .andWhere( function () {
        this.where({recordtype:'HelpfulInformation'})
        .orWhere({recordtype:'Page'})
    })
    return query
}

// query = "Select id, recorddesc as description,fileLink from PublicRecords where pageLink='"  +
    // groupDataWithNewsletters.link +"' and (recordtype='HelpfulInformation' or recordtype='Page')";

//================================================
function pullWasteTypes(dbConn, groupName) {
    const fieldList = ["id","datatext as wasteType", ]
    const query =  dbConn('ListData')
    // .leftJoin('PageText','PageText.pageLink', 'Groups.pageLink')
    .select( fieldList)
    .where({'ListData.pageLink':groupName})
    .andWhere({'ListData.listName':'WasteTypes'})
    return query
/*
    query = "Select id, datatext as wasteType from ListData where pageLink='" + groupData.link +"' and listName='WasteTypes'";
    return simpleDBQuery(query).
    then(wasteTypes => {
        return Promise.all( wasteTypes.map(wasteType => {
            query = "Select datatext as rule from ListData where listParentID='" + wasteType.id + "' and listName='WasteTypesRules'";
            return simpleDBQuery(query).
            then(rules => {
                var ruleStringArray = rules.map(  rule => {
                    return rule.rule;
                });
                wasteType.rules = ruleStringArray;
                return wasteType;
            })
        }) // map wasteTypes
    ) //  Promise All
    */
}

//================================================
function pullGroupPageText(dbConn, groupName) {
    const fieldList = ["PageText.sectionName",   "groupDescription as description", "PageText.html", ]
    // const fieldList = ["PageText.sectionName",   "groupDescription as description", "PageText.id as html", ]
    const query =  dbConn('Groups')
    .leftJoin('PageText','PageText.pageLink', 'Groups.pageLink')
    .select( fieldList)
    .where({'Groups.pageLink':groupName})
    .andWhere( function () {
        this.where({sectionName:'text1'})
        .orWhere({sectionName:'desc'})
    })

    return query
}

//================================================
function pullGroupMembers(dbConn, groupName) {
    const fieldList = ["GroupMembers.id","firstName" , "lastName","term","Users.phone"," Users.emailAddress as email"," GroupMembers.office"]
    const query =  dbConn('GroupMembers')
    .leftJoin('Groups','GroupMembers.groupID', 'Groups.id')
    .leftJoin('Users','GroupMembers.userID', 'Users.id')
    .select( fieldList)
    .where({'Groups.pageLink':groupName})

    return query

    /*
    return query
    .then(groupDataWithPageText =>{
        // query = "Select id,name,term,phone, email, office from GroupMembers where pageLink='" + groupDataWithPageText.link +"' ";
        query = "Select GroupMembers.id, concat(firstName, ' ', lastName) as name ,term,Users.phone, Users.emailAddress as email, GroupMembers.office " +
        " from GroupMembers " +
        " left Join Groups on Groups.id = GroupMembers.groupID " +
        " left Join Users on Users.id = GroupMembers.userID " +
        " where Groups.pageLink='" + groupDataWithPageText.link +"' ";
        // console.log(query);
        return simpleDBQuery(query).
        then(members => {
            if (members.length > 0) {
                groupDataWithPageText.members = members;
            }
            return groupDataWithPageText;
        })
    })
*/
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

var knexConfig = require('../db/knexfile.js')
var knexConnection = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);
//========================================
const getKnexConnection = () => knexConnection
//========================================
const logAndRejectDBErr = (dberr) => {
    const errMsg = "DBError:"+ dberr.errorno
    console.error(errMsg);
    return Promise.reject(dberr);
}
//========================================
function enterOnlyIntoTable(knexConnection, tableName, record, checkRecord={}){
    let chk={}
    Object.assign(chk, record, checkRecord)
    delete chk.date
    return knexConnection(tableName).select('*').where(chk)
    .then(selectResults => {
        if (selectResults.length === 0) {
            return knexConnection(tableName).insert(record)
            .then(entered=> {
                return Promise.resolve(
                    Object.assign({}, record, {id:entered[0]})
                )
            })
        } else {
            return Promise.resolve(selectResults[0])
        }
    })
    // .then(results => {
    //     if (results && results.length > 0) {
    //     }
    //     return Promise.resolve([record]);
    // })
    .catch(dberr => logAndRejectDBErr(dberr))
}
//========================================
//========================================
function addOrUpdateTable(knexConnection, tableName, record, checkRecord={}){
    // console.log('addOrUpdateTable:',tableName, record, checkRecord);
    return knexConnection(tableName).select('*').where(checkRecord)
    .then(results => {
        if (results.length === 0) {
            let insertRecord=Object.assign(record, checkRecord)
            // console.log('addOrUpdateDBTable:insertRecord:', knexConnection(tableName).insert(insertRecord).toString());
            return knexConnection(tableName).insert(insertRecord)
            .then(results => {
                if (results && results.length > 0) {
                    insertRecord.id = results[0];
                }
                // console.log('addOrUpdateDBTable:insertRecord:', insertRecord);
                return Promise.resolve([insertRecord]);
            })
        } else{
            // console.log('addOrUpdateDBTable:update:', knexConnection(tableName).where(checkRecord).update(record).toString());
            return knexConnection(tableName).where(checkRecord).update(record)
            .then(update=> {
                // console.log("addOrUpdateDBTable:update", results);
                if(Array.isArray(results)) return Promise.resolve(results);
                return Promise.resolve([results]);
            })
        }
    })
    // .catch(dberr => logAndRejectDBErr(dberr))
}
//========================================
module.exports.enterOnlyIntoTable = enterOnlyIntoTable;
module.exports.addOrUpdateTable = addOrUpdateTable;
module.exports.getKnexConnection = getKnexConnection;

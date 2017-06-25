var fs = require('fs');

const DEFAULT_JSON_DIR='/home/dcarpus/code/milton_nh/react_miltonNH/server/db/json/';
const DEFAULT_DB_PATH='/home/dcarpus/code/milton_nh/react_miltonNH/server/db/phpsqlite.db';

var JSON_DIR=DEFAULT_JSON_DIR;
var DB_PATH=DEFAULT_DB_PATH;


function tableNameFromJSON(filename) {
    var basename = filename.replace('.json', '')

    switch (basename) {
        case 'WasteTypes':
        case 'WasteTypesRules':
        case 'OrganizationalPageText':
        case 'OrganizationalUnits':
        case 'OrganizationalAsides':
            return 'ListData';

    case 'PublicRecords':
    case 'Newsletters':
    case 'HelpfulInformation':
        return 'PublicRecords';

    case 'OrganizationalMembers':
        return 'GroupMembers';
    case 'FAQ':
        return 'FAQ';
    case 'FeeSchedule':
        return 'Prices';
    case 'EB2Services':
        return "ExternalServices";

        default:
            return '*** UNK table name for ' + basename;
        }
}
//======================================
function objectInsert(filename, obj) {
    var basename = filename.replace('.json', '')

    switch (basename) {
        case 'WasteTypes':
        return [ {listName: basename, pageLink: 'PublicWorks', datatext:obj.wasteType + ' (' + obj.note + ')', pkey:obj.key, listParentID:0} ]
            break;
        case 'WasteTypesRules':
            return [{listName: basename, pageLink: 'PublicWorks', datatext:obj.desc, pkey:obj.key, listParentID:0}]
            break;
        case 'OrganizationalPageText':
            var pagetext = obj.pagetext[0];
            if (typeof pagetext == 'undefined') {
                console.log("pagetext undefined??" , obj);
            }
            if ( pagetext.desc) {
                return [{listName: basename, pageLink:obj.link, datatext:pagetext.desc, listParentID:0}]
            }
            if ( pagetext.text1) {
                return [{listName: basename, pageLink:obj.link, datatext:pagetext.text1, listParentID:0}]
            }
            break;
        case 'PublicRecords':
            return [{ pageLink: obj.groupName, date:obj.date || (new Date()).toString(),
                recordtype:obj.type, recorddesc:obj.desc || "", fileLink:obj.link, mainpage: obj.mainpage || false,}];
            break;
        case 'OrganizationalUnits':
            return [{listName: basename , pageLink: obj.link, datatext:obj.desc, datadesc:obj.desc,listParentID:0}]
            break;
        case 'OrganizationalMembers':
            var result = obj.members.map(member => {
                return {pageLink:obj.link,name:member.name, term:member.term, phone:member.phone, office:member.office}
            })
            return result;
            break;
        case 'OrganizationalAsides':
            var result = obj.asides.map(aside => {
                return { listName: 'PageAsides', pageLink:obj.link, fileLink:aside.link, datatext:aside.desc, datadesc:aside.desc, listParentID:0}
            })
            return result;
            break;
        case 'FAQ':
            return [{pageLink: obj.link, question:obj.question, answer:obj.answer}]
            break;
        case 'FeeSchedule':
            return [{ listName: basename,pricedesc:obj.desc, price:Number(obj.price.replace(/[^0-9\.]+/g,""))}];
            break;
        case 'HelpfulInformation':
            return [{pageLink: 'CodeEnforcement', date:obj.date || (new Date()).toString(),
                        recordtype:'HelpfulInformation', recorddesc:obj.desc, fileLink:obj.link, mainpage: false,}];
            break;
        case 'EB2Services':
            return [{pageLink: obj.link, servicetype:'EB2Service', servicedesc:obj.desc, urlLink:obj.lnk, img:obj.img}];
            break;
        case 'Newsletters':
            return [{pageLink: 'ParksRecreation', date:obj.date, recordtype:'Newsletter', recorddesc:obj.desc, fileLink:obj.link, mainpage: false,}];
            break;
        default:
        return (' ***' + basename +' : '+JSON.stringify(obj));
    }
    return null;
}

//======================================
function readJSONContent(jsonFile) {
    var filename = jsonFile.replace(/^.*[\\\/]/, '');
    filename = filename.replace('.json', '')
    return new Promise(function(resolve, reject) {
        var content = fs.readFile(jsonFile, (err, data) => {
            if (err)  reject(err)
            resolve(JSON.parse(data));
        });
    })
}

//======================================
exports.seed = function(knex, Promise) {
    var list = fs.readdirSync(JSON_DIR)
    console.log("Processing " + JSON_DIR);

    return new Promise(function(resolve, reject) {
        resolve(Promise.all(list.map( (file) => {
            console.log(file);
            return readJSONContent(JSON_DIR + file)
            .then(result => {
                let tableName = tableNameFromJSON(file);
                return Promise.all(result.map(record => {
                    let out = objectInsert(file, record)
                    if (Array.isArray(out) ) {
                        return knex(tableName).insert(out)
                    } else {
                        console.log(file  + " out:" + out);
                        return Promise.reject(out);
                    }
                }))
            })
        })));
    });
}

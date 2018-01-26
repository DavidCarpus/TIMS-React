var fs = require('fs');
var addDays = require('date-fns/add_days');
// import addDays from 'date-fns/add_days'


const DEFAULT_JSON_DIR='../../../../private/' + process.env.REACT_APP_MUNICIPALITY + '/json/';
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
            return 'ListData';

    case 'PublicRecords':
    case 'Newsletters':
    case 'HelpfulInformation':
        return 'PublicRecords';

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
            return [{ pageLink: obj.groupName, date:obj.date ||  addDays(new Date(), -28), viewcount: obj.viewcount || 0,
                recordtype:obj.type, recorddesc:obj.desc || "", fileLink:obj.link, mainpage: obj.mainpage || false,}];
            break;
        case 'FAQ':
            return [{pageLink: obj.link, question:obj.question, answer:obj.answer}]
            break;
        case 'FeeSchedule':
            return [{ listName: basename,pricedesc:obj.desc, price:Number(obj.price.replace(/[^0-9\.]+/g,""))}];
            break;
        case 'HelpfulInformation':
            return [{pageLink: 'CodeEnforcement', date:obj.date || new Date(),
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
        resolve(Promise.all(list.filter(file => {
            if (file.indexOf('OrganizationalPageText.json') >= 0) { return false;}
            if (file.indexOf('Menus.json') >= 0) { return false;}
            if (file.indexOf('GroupNames.json') >= 0) { return false;}
            if (file.indexOf('Groups.json') >= 0) { return false;}
            if (file.indexOf('OrganizationalAsides.json') >= 0) { return false;}
            if (file.indexOf('OrganizationalUnits.json') >= 0) { return false;}
            if (file.indexOf('OrganizationalMembers.json') >= 0) { return false;}

            return true;
            })
            .map( (file) => {
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
            .catch(err => {
                console.log(file  + " err:" , err);
            })
        })));
    });
}

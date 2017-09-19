var fs = require('fs');
// var toMarkdown = require('to-markdown');
var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);

const DEFAULT_JSON_DIR='../../../private/' + process.env.REACT_APP_MUNICIPALITY + '/json/';
var JSON_DIR=DEFAULT_JSON_DIR;

//======================================
function tableNameFromJSON(filename) {
    var basename = filename.replace('.json', '')

    switch (basename) {
        case 'Menus':
            return 'Menus';
        default:
            return '*** UNK table name for ' + basename;
        }
}
//======================================
function readJSONContent(jsonFile) {
    var filename = jsonFile.replace(/^.*[\\\/]/, '');
    filename = filename.replace('.json', '')
    return new Promise(function(resolve, reject) {
        var content = fs.readFile(jsonFile, (err, data) => {
            // console.log('read:' , jsonFile);
            if (err)  reject(err)
            resolve(JSON.parse(data));
        });
    })
}
//======================================
function importMenus(knex = null) {
    var list = fs.readdirSync(JSON_DIR)

    return new Promise(function(resolve, reject) {
        resolve(Promise.all(list.filter(file => {
            return file.indexOf('Menus.json') >= 0
        })
        .map( (file) => {
            console.log("Processing " + file);
            return readJSONContent(JSON_DIR + file)
            .then(jsonContent => {
                let tableName = tableNameFromJSON(file);
                // console.log('tableName:', tableName);
                // console.log('jsonContent:' , require('util').inspect(jsonContent, { depth: null }));
                let insertData = [];
                jsonContent.map(record => {
                    let mainMenu = {fullLink:record.link, pageLink:record.link, description: record.desc }
                        // console.log(mainMenu);
                        insertData.push(mainMenu)
                        // TODO: add knex.insert promise for mainMenu to insertData array

                        if (record.menus) {
                            record.menus.map(subMenu => {
                                let subMenuLink = subMenu.link;
                                if (subMenuLink.startsWith('http')) {
                                    subMenuLink = '/' + subMenuLink
                                }
                                let subMenuDataToInsert = {fullLink:record.link + subMenuLink, pageLink:subMenu.link, description: subMenu.desc}
                                insertData.push(subMenuDataToInsert)
                            })

                        }
                })
                return Promise.all(insertData.map( dataToInsert =>{
                    if (knex !== null) {
                        return knex(tableName).insert(dataToInsert)
                        .then(result => {
                            return Promise.resolve(result);
                        })
                        .catch(err => {console.log('Menus import error:', err);})
                    } else {
                        return Promise.resolve(dataToInsert); // We are running from CLI and will output this
                    }
                }))
            })
        })));
    })
}

exports.up = function(knex, Promise) {
    console.log('Creating Menus Table')

    return knex.schema.createTableIfNotExists('Menus', function (table) {
        table.increments('id');
        table.string('pageLink');
        table.string('fullLink');
        table.string('description');
  })  .then( created => {
        return importMenus(knex)}
    )
};

exports.down = function(knex, Promise) {
    console.log('Dropping Menus Table')
  return knex.schema.dropTableIfExists('Menus');
};

if (require.main === module) {
    console.log('server/libs/db/migrations/20170710155319_Menus.js - called directly');
    importMenus(knexConnection)
    // importMenus()
    .then( data => {
        console.log('Menus import:', JSON.stringify(data));
        return Promise.resolve(data);
    })
    .then( done => {
        console.log('done:', done);
        process.exit()
    })
    .catch(err => {
        console.log('Menus import error:', err);
    });
}

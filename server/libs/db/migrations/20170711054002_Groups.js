var fs = require('fs');
// var toMarkdown = require('to-markdown');
var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);

const DEFAULT_JSON_DIR='/home/dcarpus/code/milton_nh/react_miltonNH/server/db/json/';
var JSON_DIR=DEFAULT_JSON_DIR;

//======================================
function tableNameFromJSON(filename) {
    var basename = filename.replace('.json', '')

    switch (basename) {
        case 'OrganizationalUnits':
            return 'Groups';
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
function importOrganizationalUnits(knex = null) {
    var list = fs.readdirSync(JSON_DIR)

    return new Promise(function(resolve, reject) {
        resolve(Promise.all(list.filter(file => {
            return file.indexOf('OrganizationalUnits.json') >= 0
        })
        .map( (file) => {
            console.log("Processing " + file);
            return readJSONContent(JSON_DIR + file)
            .then(jsonContent => {
                let tableName = tableNameFromJSON(file);

                return Promise.all(jsonContent.map( record =>{
                    let dataToInsert = {
                        pageLink:record.link,
                        groupName:record.link,
                        groupDescription:record.desc,
                        address:"",
                        phone:"",
                        fax:"",
                        hours:"",
                    }
                    if (dataToInsert.groupName.startsWith("http")) {
                        dataToInsert.groupName = dataToInsert.groupDescription.replace(new RegExp(' ', 'g'),'')
                    }
                    // console.log(require('util').inspect(dataToInsert, { depth: null }));
                    // return Promise.resolve(dataToInsert);

                    if (knex !== null) {
                        return knex(tableName).insert(dataToInsert)
                        .then(result => {
                            return Promise.resolve(result);
                        })
                        .catch(err => {console.log(tableName + ' import error:', err);})
                    } else {
                        return Promise.resolve(dataToInsert); // We are running from CLI and will output this
                    }
                }))
            })
        })));
    })
}

exports.up = function(knex, Promise) {
    console.log('Creating Groups Table')
    return knex.schema.createTableIfNotExists('Groups', function (table) {
      table.increments('id');
      table.text('pageLink');
      table.string('groupName');
      table.string('groupDescription');
      table.string('address');
      table.string('phone');
      table.string('fax');
      table.text('hours');
  })
  .then( created => {
       return importOrganizationalUnits(knex)}
   )
};

exports.down = function(knex, Promise) {
    console.log('Dropping Groups Table')
  return knex.schema.dropTableIfExists('Groups');

};

if (require.main === module) {
    console.log('server/libs/db/migrations/' + '20170711054002_Groups'+ ' - called directly');
    importOrganizationalUnits() // knexConnection
    .then( data => {
        console.log('Groups import:', JSON.stringify(data));
        return Promise.resolve(data);
    })
    .then( done => {
        // console.log('done:', done);
        process.exit()
    })
    .catch(err => {
        console.log('Groups import error:', err);
    });
}

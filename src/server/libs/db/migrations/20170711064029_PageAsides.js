var fs = require('fs');
var toMarkdown = require('to-markdown');
var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);

const DEFAULT_JSON_DIR='/home/dcarpus/code/milton_nh/react_miltonNH/server/db/json/';
var JSON_DIR=DEFAULT_JSON_DIR;

//======================================
function tableNameFromJSON(filename) {
    var basename = filename.replace('.json', '')

    switch (basename) {
        case 'OrganizationalAsides':
            return 'PageAsides';
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
function importPageAsides(knex = null) {
    var list = fs.readdirSync(JSON_DIR)

    return new Promise(function(resolve, reject) {
        resolve(Promise.all(list.filter(file => {
            return file.indexOf('OrganizationalAsides.json') >= 0
        })
        .map( (file) => {
            console.log("Processing " + file);
            return readJSONContent(JSON_DIR + file)
            .then(jsonContent => {
                let tableName = tableNameFromJSON(file);

                return Promise.all(jsonContent.map( page =>{
                    // console.log(require('util').inspect(page, { depth: null }));
                    return Promise.all(page.asides.map( aside =>{
                        // console.log(require('util').inspect(aside, { depth: null }));
                        let html = aside.desc
                        let md=html? toMarkdown(html):""

                        let dataToInsert = {
                            pageLink:page.link,
                            html:html,
                            markdown:md,
                        }
                        if (aside.link) {
                            dataToInsert.link =aside.link
                        }

                        if (knex !== null) {
                            return knex(tableName).insert(dataToInsert)
                            .then(result => {
                                return Promise.resolve(result);
                            })
                            .catch(err => {console.log(tableName + ' import error:', err);})
                        } else {
                            return Promise.resolve(dataToInsert); // We are running from CLI and will output this
                        }
                        // console.log(require('util').inspect(dataToInsert, { depth: null }));
                    }))
                }))



            })
        })));
    })
}


exports.up = function(knex, Promise) {
    console.log('Creating PageAsides Table')
    return knex.schema.createTableIfNotExists('PageAsides', function (table) {
      table.increments('id');
      table.bigInteger('menuID');
      table.text('pageLink');
      table.text('markdown');
      table.text('html');
      table.text('link');
  })
  .then( created => {
       return importPageAsides(knex)}
   )
};

exports.down = function(knex, Promise) {
    console.log('Dropping PageAsides Table')
  return knex.schema.dropTableIfExists('PageAsides');

};

if (require.main === module) {
    console.log('server/libs/db/migrations/20170711064029_PageAsides.js - called directly');
    importPageAsides() //knexConnection
    // importMenus()
    .then( data => {
        // console.log('Menus import:', JSON.stringify(data));
        return Promise.resolve(data);
    })
    .then( done => {
        console.log('done:',require('util').inspect(done, { depth: null }));
        // console.log('done:', done);
        process.exit()
    })
    .catch(err => {
        console.log('PageAsides import error:', err);
    });
}

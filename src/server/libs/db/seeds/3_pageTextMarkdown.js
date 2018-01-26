var fs = require('fs');
var toMarkdown = require('to-markdown');
var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);

const DEFAULT_JSON_DIR='../../../../private/' + process.env.REACT_APP_MUNICIPALITY + '/json/';
var JSON_DIR=DEFAULT_JSON_DIR;

function tableNameFromJSON(filename) {
    var basename = filename.replace('.json', '')

    switch (basename) {
        case 'OrganizationalPageText':
            return 'PageText';
        default:
            return '*** UNK table name for ' + basename;
        }
}
//======================================
function objectInsert(filename, obj) {
    var basename = filename.replace('.json', '')

    switch (basename) {
        case 'OrganizationalPageText':
            var pagetext = obj.pagetext[0];
            if (typeof pagetext == 'undefined') {
                console.log("pagetext undefined??" , obj);
            }
            if ( pagetext.desc) {
                let md = toMarkdown(pagetext.desc)
                return [{pageLink:obj.link,
                    html:pagetext.desc,
                    markdown: md,
                    sectionName: 'desc'}]
            }
            if ( pagetext.text1) {
                let md = toMarkdown(pagetext.text1)
                return [{pageLink:obj.link,
                    html:pagetext.text1,
                    markdown: md,
                    sectionName:'text1'}]
            }
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
            console.log('read:' , jsonFile);
            if (err)  reject(err)
            resolve(JSON.parse(data));
        });
    })
}
//======================================
function importPageText(knex = null) {
    var list = fs.readdirSync(JSON_DIR)

    return new Promise(function(resolve, reject) {
        resolve(Promise.all(list.filter(file => {return file.indexOf('OrganizationalPageText.json') >= 0}).map( (file) => {
            console.log("Processing " + file);
            return readJSONContent(JSON_DIR + file)
            .then(result => {
                let tableName = tableNameFromJSON(file);
                console.log('tableName:', tableName);
                return Promise.all(result.map(record => {
                    let out = objectInsert(file, record)
                    // console.log('insert?');
                    if (Array.isArray(out) && knex !== null) {
                        return knex(tableName).insert(out).catch(err => {console.log('PageText import error:', err);})
                    } else {
                        if (knex !== null) {
                            return Promise.reject(out); //we are running knex migrate. This is an error.
                        } else {
                            return Promise.resolve(out); // We are running from CLI and will output this
                        }
                        // console.log(file  + " out:" , out);
                    }
                    // console.log('insert!');
                }))
            })
        })));
    })
}
//======================================

// TODO: Migrate html pageText from the ListData table to new PageText table
 // and convert html to markdown

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('PageText').del()
    .then(function () {
        return importPageText(knex)
    })
    .catch(err => {
        console.log('PageText import error:', err);
    });
};

if (require.main === module) {
    console.log('server/libs/db/seeds/3_pageTextMarkdown.js - called directly');
    importPageText(knexConnection)
    .then( data => {
        console.log('PageText import:', JSON.stringify(data));
        return Promise.resolve(data);
    })
    .then( done => {
        console.log('done:', done);
        process.exit()
    })
    .catch(err => {
        console.log('PageText import error:', err);
    });
}

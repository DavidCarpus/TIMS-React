var fs = require('fs');
var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);


const DEFAULT_JSON_DIR='../../../../private/' + process.env.REACT_APP_MUNICIPALITY + '/json/';
var JSON_DIR=DEFAULT_JSON_DIR;
//======================================
function tableNameFromJSON(filename) {
    var basename = filename.replace('.json', '')

    switch (basename) {
        case 'OrganizationalMembers':
            return 'GroupMembers';
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
            if (err)  reject(err)
            resolve(JSON.parse(data));
        });
    })
}
//======================================
function importGroupMembers(knex = null) {
    var list = fs.readdirSync(JSON_DIR)

    return new Promise(function(resolve, reject) {
        resolve(Promise.all(list.filter(file => {return file.indexOf('OrganizationalMembers.json') >= 0}).map( (file) => {
            console.log("Processing " + file);
            return readJSONContent(JSON_DIR + file)
            .then(result => {
                let tableName = tableNameFromJSON(file);
                console.log('tableName:', tableName);
                return Promise.all(result.map(organization=> {
                    // console.log(require('util').inspect(organization, { depth: null }));
                    return Promise.all(organization.members.map(member=> {
                        //lookup in users table
                        // console.log(member);
                        let names=member.name.split(' ');
                        return (knex('Users').select().where({lastName:names[1],firstName:names[0]})
                            .then(user => {
                                if (user.length <=0) { return Promise.reject('Lookup of ' , names, ' failed.') }
                                return user;
                            })
                            .then(validUser => {
                                return (knex('Groups').select().where({pageLink:organization.link})
                                    .then(groupLookup => {
                                        if (groupLookup.length <=0) { return Promise.reject('Lookup of ' , organization.link, ' failed.') }
                                        let dataToInsert = {userID:validUser[0].id, groupID:groupLookup[0].id}
                                        if (member.term) {dataToInsert.term=member.term }
                                        if (member.office) {dataToInsert.office=member.office }
                                        if (knex !== null) {
                                            return knex(tableName).insert(dataToInsert)
                                            .then(result => {
                                                return Promise.resolve(result);
                                            })
                                            .catch(err => {console.log(tableName + ' import error:', err);})
                                        } else {
                                            return Promise.resolve(dataToInsert); // We are running from CLI and will output this
                                        }
                                        return Promise.resolve(dataToInsert)
                                    })
                                )
                            })
                        )
                    }))
                }))
            })
        })));
    })
}
//======================================
exports.up = function(knex, Promise) {
    console.log('Creating GroupMembers Table')
    return knex.schema.createTableIfNotExists('GroupMembers', function (table) {
      table.increments('id');
    //   table.text('pageLink');
      table.bigInteger('groupID');
      table.bigInteger('userID');
      table.string('term');
      table.string('office');
  })  .then( created => {
        return importGroupMembers(knex)}
    )
};

exports.down = function(knex, Promise) {
    console.log('Dropping GroupMembers Table')
  return knex.schema.dropTableIfExists('GroupMembers');
};

if (require.main === module) {
    console.log('server/libs/db/migrations/' + '20170711054002_Groups'+ ' - called directly');
    importGroupMembers(knexConnection) // knexConnection
    .then( data => {
        console.log('Groups import:',require('util').inspect(data, { depth: null }));
        // console.log('Groups import:', JSON.stringify(data));
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

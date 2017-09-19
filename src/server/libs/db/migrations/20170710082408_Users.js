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
        case 'OrganizationalMembers':
            return 'Users';
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
function importOrganizationalMembers(knex = null) {
    var list = fs.readdirSync(JSON_DIR)

    return new Promise(function(resolve, reject) {
        resolve(Promise.all(list.filter(file => {
            return file.indexOf('OrganizationalMembers.json') >= 0
        })
        .map( (file) => {
            console.log("Processing " + file);
            return readJSONContent(JSON_DIR + file)
            .then(jsonContent => {
                let tableName = tableNameFromJSON(file);

                return Promise.all(jsonContent.map( organization =>{
                    // console.log('organization:' , require('util').inspect(organization, { depth: null }));
                    return Promise.all(organization.members.map( member =>{
                        let name=member.name.split(' ')
                        console.log('member:', member);

                        let dataToInsert = {
                            // pageLink:organization.link,
                            firstName:name[0],
                            lastName:name[1],
                            phone:member.phone || '',
                            emailAddress:member.emailAddress || '',
                        }
                        if (member.phone) {
                            dataToInsert.phone = member.phone
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
                    }))
                }))
            })
        })));
    })
}

exports.up = function(knex, Promise) {
    console.log('Creating Users Table')
        return knex.schema.createTableIfNotExists('Users', function (table) {
          table.increments('id');
          table.string('firstName');
          table.string('lastName');
          table.string('phone');
          table.string('extension');
          table.string('fax');
          table.string('emailAddress');
          table.boolean('login');
          table.string('password');
          table.string('username');
      })
      .then( created => {
          return importOrganizationalMembers(knex)}
      )
};

exports.down = function(knex, Promise) {
    console.log('Dropping Users Table')
  return knex.schema.dropTableIfExists('Users');

};

if (require.main === module) {
    console.log('server/libs/db/migrations/' + '20170710082408_Users'+ ' - called directly');
    importOrganizationalMembers() // knexConnection
    .then( data => {
        console.log('Users import:', require('util').inspect(data, { depth: null }));
        return Promise.resolve(data);
    })
    .then( done => {
        // console.log('done:', done);
        process.exit()
    })
    .catch(err => {
        console.log('Users import error:', err);
    });
}
//
// function migrateUserDataFromGroupMembers(knex) {
//     console.log('migrateUserDataFromGroupMembers')
//
//     let insertion =  knex.insert(knex("GroupMembers").select(
//         knex.raw("0 as id"),
//         knex.raw("SUBSTRING_INDEX(SUBSTRING_INDEX(name, ' ', 1), ' ', -1) as firstName"),
//         knex.raw("SUBSTRING_INDEX(SUBSTRING_INDEX(name, ' ', 2), ' ', -1) as lastName"),
//         knex.raw("GroupMembers.phone"),
//         'extension', 'fax',
//         knex.raw("GroupMembers.email as emailAddress"),
//         knex.raw("0 as login"),
//         'password', 'username'
//     ).leftJoin("Users", function() {
//         this.on("Users.lastName", "lastName").orOn("Users.firstName", "firstName")
//     }).whereNull("Users.id"))
//     .into("Users");
//
//     // console.log(insertion.toString());
//     return insertion
// }
//
// exports.up = function(knex, Promise) {
//     console.log('Creating Users Table')
//
//     return knex.schema.createTableIfNotExists('Users', function (table) {
//       table.increments('id');
//       table.string('firstName');
//       table.string('lastName');
//       table.string('phone');
//       table.string('extension');
//       table.string('fax');
//       table.string('emailAddress');
//       table.boolean('login');
//       table.string('password');
//       table.string('username');
//   })
//   .then( created => {
//       return migrateUserDataFromGroupMembers(knex)}
//   )
//   // .then(results => {
//   //     console.log(require('util').inspect(results, { depth: null }));
//   // })
// };
//
// exports.down = function(knex, Promise) {
//     console.log('Dropping Users Table')
//   return knex.schema.dropTableIfExists('Users');
//
// };

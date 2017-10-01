var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);

exports.up = function(knex, Promise) {
    return   knex.schema.table('PublicRecords', function (table) {
        table.bigInteger('viewcount');
  })

};

exports.down = function(knex, Promise) {
    return   knex.schema.table('PublicRecords', function (table) {
      table.dropColumn('viewcount');
  })
};

if (require.main === module) {
    console.log(
        knexConnection.schema.table('PublicRecords', function (table) {
            table.integer('viewcount');
        }).toString()
    )
  process.exit()
}

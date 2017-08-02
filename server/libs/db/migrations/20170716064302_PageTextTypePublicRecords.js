var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);

exports.up = function(knex, Promise) {
    // alter table `users` add `first_name` varchar(255), add `last_name` varchar(255);
    return   knex.schema.table('PublicRecords', function (table) {
      table.integer('pageTextID');
  })

};

exports.down = function(knex, Promise) {
    return   knex.schema.table('PublicRecords', function (table) {
      table.dropColumn('pageTextID');
  })
};

// }).createTableIfNotExists('PublicRecords', function (table) {
// pageTextif (require.main === module) {
if (require.main === module) {
    console.log(
        knexConnection.schema.table('PublicRecords', function (table) {
            table.integer('pageTextID');
        }).toString()
    )
  process.exit()
}

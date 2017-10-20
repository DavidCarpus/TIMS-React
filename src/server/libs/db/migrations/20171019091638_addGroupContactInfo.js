var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);

const create = (connection) =>
connection.schema.table('Groups', function (table) {
        table.string('city');
        table.string('state');
        table.string('postalCode');
        table.string('meetingLocation');
        table.string('meetingTimes');
        table.renameColumn('address', 'street')
  })
  const drop = (connection) =>
  connection.schema.table('Groups', function (table) {
      table.dropColumn('city');
      table.dropColumn('state');
      table.dropColumn('postalCode');
      table.dropColumn('meetingLocation');
      table.dropColumn('meetingTimes');
    //   table.renameColumn('street', 'address')
  })

exports.up = function(knex, Promise) {
    return create(knex)
};

exports.down = function(knex, Promise) {
    return drop(knex)
};

if (require.main === module) {
    console.log(
        create(knexConnection)
        .then( () => process.exit())
    )
}

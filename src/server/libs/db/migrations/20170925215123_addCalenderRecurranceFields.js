var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);

exports.up = function(knex, Promise) {
    return   knex.schema.table('CalendarEvents', function (table) {
        table.bigInteger('elapsed');
        table.integer('sequence');
        table.string('recurrenceID');

    }).then( function () {
        console.log("knex('CalendarEvents').del()");
        return knex('CalendarEvents').del()
    })
};

  // return knex('table_name').del()
  //   .then(function () {

exports.down = function(knex, Promise) {
    return   knex.schema.table('CalendarEvents', function (table) {
        table.dropColumn('elapsed');
        table.dropColumn('sequence');
        table.dropColumn('recurrenceID');
  })
};

if (require.main === module) {
    console.log(
        knexConnection.schema.table('CalendarEvents', function (table) {
            table.string('freq');
            table.bigInteger('elapsed');
            table.integer('sequence');
            table.string('recurrenceID');
        }).toString()
    )
  process.exit()
}

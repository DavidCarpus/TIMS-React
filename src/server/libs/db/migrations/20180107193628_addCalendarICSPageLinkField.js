
exports.up = function(knex, Promise) {
      return   knex.schema.table('CalendarEvents', function (table) {
          table.string('pageLink');
          table.string('eventType');
          table.string('URI');
    })

};

exports.down = function(knex, Promise) {
    return   knex.schema.table('CalendarEvents', function (table) {
        table.dropColumn('pageLink');
        table.dropColumn('eventType');
        table.dropColumn('URI');
    })

};

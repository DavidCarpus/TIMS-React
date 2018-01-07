
exports.up = function(knex, Promise) {
    return   knex.schema.table('CalendarEvents', function (table) {
        table.string('rrule_FREQ');
        table.timestamp('rrule_UNTIL');
        table.integer('rrule_INTERVAL');
        table.string('rrule_BYMONTHDAY');
        table.string('rrule_WKST');
        table.string('rrule_BYDAY');
        table.string('rrule_COUNT');
        table.string('rrule_BYMONTH');
        table.string('uid');
        table.string('status');
        table.dateTime('created');
        table.dateTime('modifiedDate');
  })

};

exports.down = function(knex, Promise) {
    return   knex.schema.table('CalendarEvents', function (table) {
        table.dropColumn('rrule_FREQ');
        table.dropColumn('rrule_UNTIL');
        table.dropColumn('rrule_INTERVAL');
        table.dropColumn('rrule_BYMONTHDAY');
        table.dropColumn('rrule_WKST');
        table.dropColumn('rrule_BYDAY');
        table.dropColumn('rrule_COUNT');
        table.dropColumn('rrule_BYMONTH');
        table.dropColumn('uid');
        table.dropColumn('status');
        table.dropColumn('created');
        table.dropColumn('modifiedDate');
  })
};


exports.up = function(knex, Promise) {
    console.log('Creating MeetingStatus Table')
    return knex.schema.createTableIfNotExists('MeetingStatus', function (table) {
        table.increments('id');
        table.text('pageLink');
        table.date('date');
        table.string('status');
    })
};

exports.down = function(knex, Promise) {
    console.log('Dropping MeetingStatus Table')
  return knex.schema.dropTableIfExists('MeetingStatus');
};

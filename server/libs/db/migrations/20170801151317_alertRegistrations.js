
exports.up = function(knex, Promise) {
      console.log('Creating AlertRegistrations')
  return knex.schema.createTableIfNotExists('AlertRegistrations', function (table) {
    table.increments('id');
    table.integer('alertUserID');
    table.string('noticeType');
    table.timestamp('registrationDate');
    })
};

exports.down = function(knex, Promise) {
    console.log('Dropping AlertRegistrations Table')
  return knex.schema.dropTableIfExists('AlertRegistrations');
};

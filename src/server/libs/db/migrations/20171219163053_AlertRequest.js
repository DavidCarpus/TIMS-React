
exports.up = function(knex, Promise) {
      console.log('Creating AlertRequest Table')
  return knex.schema.createTableIfNotExists('AlertRequest', function (table) {
    table.increments('alertRequestId');
    table.timestamp('dateRequested');
    table.timestamp('dateValidationSent');
    table.timestamp('dateValidated');
    table.timestamp('dateRejected');

    table.string('contact');
    table.string('contactType');
    table.string('carrier');
    })
};

exports.down = function(knex, Promise) {
    console.log('Dropping AlertRequest Table')
  return knex.schema.dropTableIfExists('AlertRequest');
};

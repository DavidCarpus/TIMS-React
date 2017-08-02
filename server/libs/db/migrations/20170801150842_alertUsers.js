
exports.up = function(knex, Promise) {
      console.log('Creating AlertUsers')
  return knex.schema.createTableIfNotExists('AlertUsers', function (table) {
    table.increments('id');
    table.string('contact').unique();
    table.string('carrier');

    // table.timestamp('dateCreated');
    table.timestamp('dateUpdated');
    table.timestamp('dateVerified');
    })
};

exports.down = function(knex, Promise) {
    console.log('Dropping AlertUsers Table')
  return knex.schema.dropTableIfExists('AlertUsers');
};

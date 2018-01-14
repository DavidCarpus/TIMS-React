
exports.up = function(knex, Promise) {
      console.log('Creating AlertRequestData Table')
  return knex.schema.createTableIfNotExists('AlertRequestData', function (table) {
      table.increments('alertRequestDataId');
      table.bigInteger('alertRequestID');
      table.string('pageLink');
      table.string('recordType');
    })
};

exports.down = function(knex, Promise) {
    console.log('Dropping AlertRequestData Table')
  return knex.schema.dropTableIfExists('AlertRequestData');
};


exports.up = function(knex, Promise) {
    console.log('Creating pageText Table')
    return knex.schema.createTableIfNotExists('PageText', function (table) {
      table.increments('id');
      table.text('pageLink');
      table.string('sectionName');
      table.text('markdown');
      table.text('html');
  })
};

exports.down = function(knex, Promise) {
    console.log('Dropping pageText Table')
  return knex.schema.dropTableIfExists('PageText');
};

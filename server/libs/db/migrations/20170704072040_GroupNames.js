
exports.up = function(knex, Promise) {
    console.log('Creating GroupNames Table')
    return knex.schema.createTableIfNotExists('GroupNames', function (table) {
      table.increments('id');
      table.text('pageLink');
      table.string('groupName');
  })
};

exports.down = function(knex, Promise) {
    console.log('Dropping GroupNames Table')
  return knex.schema.dropTableIfExists('GroupNames');
};

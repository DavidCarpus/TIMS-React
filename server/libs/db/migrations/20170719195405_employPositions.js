
exports.up = function(knex, Promise) {
      console.log('Creating EmploymentPositions')
  return knex.schema.createTableIfNotExists('EmploymentPositions', function (table) {
    table.increments('id');
    table.string('description');
    table.text('pageLink');
    table.date('datePosted');
    table.date('dateRemoved');
    table.date('expiredate');
    table.text('markdown');
    table.text('html');
    table.text('fileLink');
    })
};

exports.down = function(knex, Promise) {
    console.log('Dropping EmploymentPositions Table')
  return knex.schema.dropTableIfExists('EmploymentPositions');
};

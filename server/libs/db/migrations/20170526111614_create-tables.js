
exports.up = function(knex, Promise) {
    console.log('Creating Tables')
  return knex.schema.createTableIfNotExists('ListData', function (table) {
    table.increments('id');
    table.string('listName');
    table.text('pageLink');
    table.text('datatext');
    table.bigInteger('pkey');
    table.text('fileLink');
    table.text('datadesc');
    table.bigInteger('listParentID');
}).createTableIfNotExists('PublicRecords', function (table) {
    table.increments('id');
    table.text('pageLink');
    table.date('date');
    table.date('expiredate');
    table.string('recordtype');
    table.string('recorddesc');
    table.text('fileLink');
    table.boolean('mainpage').defaultTo(0);
}).createTableIfNotExists('ExternalServices', function (table) {
    table.increments('id');
    table.string('pageLink');
    table.string('servicetype');
    table.string('servicedesc');
    table.text('urlLink');
    table.text('img');
}).createTableIfNotExists('GroupMembers', function (table) {
    table.increments('id');
    table.string('pageLink');
    table.text('name');
    table.string('term');
    table.string('office');
    table.string('phone');
    table.string('email');
}).createTableIfNotExists('Prices', function (table) {
    table.increments('id');
    table.string('listName');
    table.string('pricedesc');
    table.decimal('price');
}).createTableIfNotExists('FAQ', function (table) {
    table.increments('id');
    table.string('pageLink');
    table.text('question');
    table.text('answer');
}).createTableIfNotExists('Menus', function (table) {
    table.increments('id');
    table.string('pageLink');
    table.string('fullLink');
    table.string('description');
})
};

exports.down = function(knex, Promise) {
    console.log('Dropping Tables')
  return knex.schema.dropTableIfExists('ListData')
  .dropTableIfExists('PublicRecords')
  .dropTableIfExists('ExternalServices')
  .dropTableIfExists('GroupMembers')
  .dropTableIfExists('Prices')
  .dropTableIfExists('FAQ')
  .dropTableIfExists('Menus')
  .then(function () {
    console.log('Tables were dropped')
  })
};

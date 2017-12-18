
exports.up = function(knex, Promise) {
    console.log('News')
    return knex.schema.createTableIfNotExists('News', function (table) {
        table.increments('id');
        table.text('pageLink');
        table.string('summary');
        table.text('html');
        table.text('markdown');
        table.boolean('mainpage').defaultTo(1);
        table.timestamp('datePosted');
        table.timestamp('dateExpires');
    })
};

exports.down = function(knex, Promise) {
    console.log('Dropping News Table')
    return knex.schema.dropTableIfExists('News');
};

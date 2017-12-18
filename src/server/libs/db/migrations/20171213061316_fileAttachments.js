
exports.up = function(knex, Promise) {
    console.log('FileAttachments')
    return knex.schema.createTableIfNotExists('FileAttachments', function (table) {
        table.increments('id');
        table.bigInteger('parentId');
        table.string('recordtype');
        table.text('fileLink');
        table.timestamp('datePosted');
        table.timestamp('dateExpires');
    })
};

exports.down = function(knex, Promise) {
    console.log('Dropping FileAttachments Table')
    return knex.schema.dropTableIfExists('FileAttachments');
};

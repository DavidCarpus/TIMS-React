
exports.up = function(knex, Promise) {
    return   knex.schema.table('AlertRequest', function (table) {
      table.string('validationSentMessageID');
      table.string('validationMessageID');
      table.string('validationRejectedID');
    })
};

exports.down = function(knex, Promise) {
    return   knex.schema.table('AlertRequest', function (table) {
        table.dropColumn('validationSentMessageID');
        table.dropColumn('validationMessageID');
        table.dropColumn('validationRejectedID');
    })

};

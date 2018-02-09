
exports.up = function(knex, Promise) {
      return   knex.schema.table('PublicRecords', function (table) {
          table.string('sourceUriCRC');
    })

};

exports.down = function(knex, Promise) {
    return   knex.schema.table('PublicRecords', function (table) {
        table.dropColumn('sourceUriCRC');
    })

};

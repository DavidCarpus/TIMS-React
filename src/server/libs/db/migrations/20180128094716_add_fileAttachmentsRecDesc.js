
exports.up = function(knex, Promise) {
      return   knex.schema.table('FileAttachments', function (table) {
          table.string('recorddesc');
          table.string('sourceUriCRC');
    })

};

exports.down = function(knex, Promise) {
    return   knex.schema.table('FileAttachments', function (table) {
        table.dropColumn('recorddesc');
        table.dropColumn('sourceUriCRC');
    })

};

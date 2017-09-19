
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
        return knex.raw(
            " UPDATE `ListData` as WT" +
            " LEFT JOIN `ListData` as WTR on WTR.pkey = WT.pkey"+
            " SET WTR.listParentID = WT.id"+
            " WHERE WTR.pkey is NOT NULL AND WTR.id != WT.id and WT.listName = 'WasteTypes'"
        )
};
/*
UPDATE `ListData` as WT
LEFT JOIN `ListData` as WTR on WTR.pkey = WT.pkey
SET WTR.listParentID = WT.id
WHERE WTR.pkey is NOT NULL AND WTR.id != WT.id and WT.listName = 'WasteTypes'


knex('A').update({price: true}).whereIn('id', function () { this.select('id').from('B'); });

*/

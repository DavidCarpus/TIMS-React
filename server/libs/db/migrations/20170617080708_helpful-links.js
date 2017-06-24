
exports.up = function(knex, Promise) {
    console.log('Adding table for helpful links')
    return knex('ListData').insert({listName:'HelpfulLinks', datadesc:'Test link desc', fileLink:'http://www.google.com' })
}

exports.down = function(knex, Promise) {
    return knex('ListData').where({listName:'HelpfulLinks', datadesc:'Test link desc', fileLink:'http://www.google.com' }).del()
};


exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('ListData').where({listName:'HelpfulLinks'}).del()
      .then(function () {
          return knex('ListData').insert([
              {listName:'HelpfulLinks', datadesc:'Dog Licensing', fileLink:'/Departments/TownClerk' },
              {listName:'HelpfulLinks', datadesc:'Car Registration', fileLink:'/Departments/TownClerk' },
              {listName:'HelpfulLinks', datadesc:'Property Taxes', fileLink:'/Departments/TownClerk' },
              {listName:'HelpfulLinks', datadesc:'Beach Passes', fileLink:'/Departments/TownClerk' },
          ]);
      })

    // return knex('ListData').insert({listName:'HelpfulLinks', datadesc:'Test link desc', fileLink:'http://www.google.com' })
};

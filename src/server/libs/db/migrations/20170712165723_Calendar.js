var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);
 const  calendar = require('../../calendar');

//======================================
exports.up = function(knex, Promise) {
    console.log('Creating CalendarEvents Table')
    return knex.schema.createTableIfNotExists('CalendarEvents', function (table) {
      table.increments('id');
      table.dateTime('startDate');
      table.dateTime('endDate');
      table.string('googleId');
      table.text('summary');
      table.text('description');
      table.text('location');
  // })  .then( created => {
  //       return calendar.importCalendarEvents(knex)
    })
};

exports.down = function(knex, Promise) {
    console.log('Dropping CalendarEvents Table')
  return knex.schema.dropTableIfExists('CalendarEvents');
};

if (require.main === module) {
    console.log('server/libs/db/migrations/' + '20170712165723_Calendar'+ ' - called directly');
    calendar.importCalendarEvents(knexConnection) // knexConnection
    .then( data => {
        console.log('CalendarEvents import:',require('util').inspect(data, { depth: null }));
        return Promise.resolve(data);
    })
    .then( done => {
        process.exit()
    })
    .catch(err => {
        console.log('CalendarEvents import error:', err);
    });
}

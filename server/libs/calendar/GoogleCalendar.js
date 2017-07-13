var PublicGoogleCalendar = require('public-google-calendar')
  , publicGoogleCalendar = new PublicGoogleCalendar({ calendarId: 'townmiltonnh@gmail.com' });

  //======================================

function importCalendarEvents(knex = null) {
    let tableName = 'CalendarEvents'
    return pullEventsFromGoogleICAL(addDays(new Date(), -7),addDays(new Date(), 14))
    .then(events => {
         return Promise.all(events.map(record => {
            let dataToInsert =
             {
                startDate: record.start,
                endDate: record.end,
                googleId: record.id,
                summary: record.summary,
                description: record.description,
                location: record.location,
            }
            // console.log(dataToInsert);
            if (knex !== null) {
                return (knex(tableName).select().where({googleId: dataToInsert.googleId})
                .then(results => {
                    if (results.length == 1) {
                        return Promise.resolve('Record already exists.');
                    } else {
                        return knex(tableName).insert(dataToInsert)
                        .then(result => {
                            return Promise.resolve(result);
                        })
                        .catch(err => {console.log(tableName + ' import error:', err);})
                    }
                })
            )
            } else {
                return Promise.resolve(dataToInsert); // We are running from CLI and will output this
            }
        }))
    })
}
//======================================

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  //======================================

    function pullEventsFromGoogleICAL(startDate, endDate ){
        return new Promise(function(resolve,reject){
            let sDiff =     (new Date(startDate)).getTime() - (new Date()).getTime()
            let eDiff =     (new Date(endDate)).getTime() - (new Date()).getTime()
             publicGoogleCalendar.getEvents(function(err, events) {
                 if(err !== null) return reject(err);
                 let nextMonthEvents = events.filter( eventEntry => {
                     let dateDiff = (new Date(eventEntry.start)).getTime() - (new Date()).getTime()
                     return dateDiff > sDiff && dateDiff < eDiff
                 })
                 .map(validDateRange => {
                     return {
                         status:validDateRange.status,
                         summary:validDateRange.summary,
                         description:validDateRange.description,
                         location:validDateRange.location,
                         id:validDateRange.id,
                         start:validDateRange.start,
                         end:validDateRange.end,
                     }
                 })
                  resolve(nextMonthEvents);
             });
        });
    }
    // =================================================
    // https://stackoverflow.com/questions/6398196/node-js-detect-if-called-through-require-or-directly-by-command-line
    if (require.main === module) {
        console.log('cpullEventsFromGoogleICALalled directly');
        pullEventsFromGoogleICAL(addDays(new Date(), -1),addDays(new Date(), 14) )
        .then(events=> {
            // return (knex('CalendarEntries').select().where(entry)
            // .then(results => {

            console.log(require('util').inspect(events, { depth: null }));
            process.exit();

            // return events.map(oneEvent => {
            //     return oneEvent.start;
            // })
        })
    }

// =================================================


module.exports.importCalendarEvents = importCalendarEvents;
module.exports.pullEventsFromGoogleICAL = pullEventsFromGoogleICAL;

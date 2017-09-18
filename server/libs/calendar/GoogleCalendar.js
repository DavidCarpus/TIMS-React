var PublicGoogleCalendar = require('public-google-calendar')
  , publicGoogleCalendar = new PublicGoogleCalendar({ calendarId: 'townmiltonnh@gmail.com' });
var knexConfig = require('../db/knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);

//======================================
function insertEventIntoDatabase(knex, eventToinsert) {
    let tableName = 'CalendarEvents'
    return (knex(tableName).select().where(
        {
            googleId: eventToinsert.googleId,
            startDate: new Date(eventToinsert.startDate)
        }
    )
    .then(results => {
        if (results.length >= 1) {
            return Promise.resolve('Record ' + eventToinsert.googleId + ' already exists.' + results.length);
        } else {
            return knex(tableName).insert(eventToinsert)
            .then(result => {
                eventToinsert.id = result[0];
                return Promise.resolve(eventToinsert);
            })
            .catch(err => {console.log(tableName + ' import error:', err);})
        }
    })
)
}
//======================================
function importCalendarEvents(knex = null, futureDays=31, startDate=new Date() ) {
    console.log('importCalendarEvents:', futureDays);
    // if (startDate === null) { startDate = new Date()}
    return pullEventsFromGoogleICAL(addDays(startDate, -7),addDays(new Date(), futureDays))
    .then(events => {
        // console.log('***Pulled events:', events);
         return Promise.all(events.map(record => {
            let dataToInsert =
             {
                startDate: record.start,
                endDate: record.end,
                googleId: record.id.trim(),
                summary: record.summary,
                description: record.description,
                location: record.location,
            }
            // console.log(dataToInsert);
            if (knex !== null) {
                return insertEventIntoDatabase(knex, dataToInsert);
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
                    //  console.log('validDateRange:', );
                    //  console.log('validDateRange:', require('util').inspect(validDateRange, { depth: null }));
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
        // let startDate=new Date();
        // let futureDays = 12;
        // pullEventsFromGoogleICAL(addDays(startDate, -7),addDays(new Date(), futureDays))
        // .then(events => {
        //     console.log('events:', events);
        //     process.exit();
        // })

        importCalendarEvents(knexConnection, 30)
        .then(events=> {
            // console.log("***Imported events:");
            events.map(singleEvent => {
                console.log(require('util').inspect(singleEvent, { depth: null }));
            })
            process.exit();
        })
        .catch(err => {
            console.log('importCalendarEvents Error:', err);
            process.exit();
        })
    }

// =================================================


module.exports.importCalendarEvents = importCalendarEvents;
module.exports.pullEventsFromGoogleICAL = pullEventsFromGoogleICAL;

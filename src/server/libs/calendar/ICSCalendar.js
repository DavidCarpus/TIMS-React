var Config = require('../../config'),
configuration = new Config();

var addDays = require('date-fns/add_days');
var rp = require('request-promise-native');
var icalendar = require('icalendar');

var knexConfig = require('../db/knexfile.js')
var knexConnection = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

const isRecurringEvent = (evt) =>typeof evt.rrule !== 'undefined' || typeof evt.rruleType !== 'undefined'
//===============================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}//===============================================
function calendarProcess(delay, infinite, count=2) {
    const logMsg=0
    return pullEventsFromICS('https://calendar.google.com/calendar/ical/' + configuration.calendarId + '/public/basic.ics')
    .then(events=> {// addDays(new Date(), -7),addDays(new Date(), 28)
        logMsg && console.log('Pulled', events.length, 'events.');
        return events.map( translateEventFromICal)
    })
    .then(translatedEvents => {
        logMsg && console.log('Translated', translatedEvents.length, 'events.');
        const insertEvent = (translatedEvent)=>insertEventIntoDatabase(knexConnection, translatedEvent)
        return Promise.all(translatedEvents.map(insertEvent))
    })
    .then(results => {
        // console.log(results);
        return Promise.resolve('Done')
    })
    .then(done => {
        logMsg && console.log('Sleeping');
        return sleep(delay).then(out =>{
            if (count > 0) {
                --count;
                if (infinite) {
                    logMsg && console.log('infinite', infinite, count);
                    ++count;
                }
                return calendarProcess(delay, infinite, count)
            } else {
                process.exit();
            }
        })
    } )
    .catch(err => {
        console.log('importCalendarEvents Error:', err);
        process.exit();
    })

}
//======================================
function insertEventIntoDatabase(knex, eventToinsert) {
    let tableName = 'CalendarEvents'
    return (knex(tableName).select().where(
        {
            googleId: eventToinsert.googleId,
            recurrenceID: eventToinsert.recurrenceID || null,
            startDate: new Date(eventToinsert.startDate)
        }
    )
    .then(results => {
        // console.log("insertEventIntoDatabase?", results);
        if (results.length >= 1) {
            return Promise.resolve('Record ' + eventToinsert.googleId + ' already exists.' + results.length);
        } else {
            console.log("Insert:", eventToinsert);
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

function getDateEvents(icalEvents){

}

// =================================================
function translateEventFromICal(evt) {
    const untilDate = (datestr) => new Date(datestr.substring(0,4)+ '-' + datestr.substring(4,6) + '-' + datestr.substring(6,8) +
     'T' + datestr.substring(9,11) + ':' + datestr.substring(11,13)  + ':' + datestr.substring(13,15) + "Z")
     let endDate = evt.endDate
     if (evt.rrule ) {
         const origRRULE=Object.assign({},evt.rrule)
         endDate =  evt.rrule.UNTIL ? untilDate(evt.rrule.UNTIL): null
         evt.freq = evt.rrule.FREQ
         evt.interval = evt.rrule.INTERVAL
         delete evt.rrule.UNTIL
         delete evt.rrule.FREQ
         delete evt.rrule.INTERVAL
         if (Object.keys(evt.rrule).length > 1) {
             throw("Unable to process complex RRULE",origRRULE)
         }
         evt.rruleType = Object.keys(evt.rrule)[0]
         evt.rruleData = evt.rrule[evt.rruleType]
     }
     delete evt.rrule
     if (evt.location.length === 0) { delete evt.location }
     if (evt.description.length === 0) { delete evt.description }
     if (!evt.recurrenceID || evt.recurrenceID.length === 0) { delete evt.recurrenceID }

     evt.endDate = endDate
     evt.elapsed = evt.elapsed / (1000*60)

    return evt
}

// =================================================
function pullEventsFromICS( icsURL ){
    return rp(icsURL)
    .then(htmlStr => {
        // return ical.parseICS(htmlStr)
        var ical = icalendar.parse_calendar(htmlStr);
        return ical.events()
    }).then(icalEvents => {
        return icalEvents.map(evt =>{
            const props = evt.properties
            // return props
            const icalObj = {startDate:props.DTSTART[0].value, endDate: props.DTEND[0].value,
                googleId: props.UID[0].value,
                // STATUS:props.STATUS[0].value,
                summary: props.SUMMARY[0].value,
                rrule: props.RRULE && props.RRULE[0].value,
                location: props.LOCATION && props.LOCATION[0].value,
                sequence: props.SEQUENCE && props.SEQUENCE[0].value,
                recurrenceID: props['RECURRENCE-ID'] && props['RECURRENCE-ID'][0].value,
                description: props.DESCRIPTION[0].value,
                elapsed:  props.DTEND[0].value -  props.DTSTART[0].value
            }
            // if (icalObj.googleId === 'f7qvrqn30crct84qfsul16ibsc@google.com') {
            //     // console.log('********' + require('util').inspect(evt.properties, { depth: 3 }));
            //     console.log('********', icalObj);
            // }

            return icalObj;
        })
    })
}
// =================================================
if (require.main === module) {
    calendarProcess(2000, false, 0)
}

// =================================================
module.exports.calendarProcess = calendarProcess;

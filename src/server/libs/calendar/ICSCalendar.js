var Config = require('../../config'),
configuration = new Config();

var addDays = require('date-fns/add_days');
var rp = require('request-promise-native');
var icalendar = require('icalendar');

var startOfMonth = require('date-fns/start_of_month');
var endOfMonth = require('date-fns/end_of_month');
var startOfWeek = require('date-fns/start_of_week');
var endOfWeek = require('date-fns/end_of_week');

var differenceInDays = require('date-fns/difference_in_days');
var compareAsc = require('date-fns/compare_asc');
var compareDesc = require('date-fns/compare_desc');
var addWeeks = require('date-fns/add_weeks');
var addMonths = require('date-fns/add_months');
//
// // import eachDay from 'date-fns/each_day'
// import addDays from 'date-fns/add_days'



var knexConfig = require('../db/knexfile.js')
var knexConnection = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

// const isRecurringEvent = (evt) =>typeof evt.rrule !== 'undefined' || typeof evt.rruleType !== 'undefined'
const isRecurringEvent = (evt) =>(typeof evt.rrule !== 'undefined' && evt.rrule !== null) ||
        (typeof evt.rruleType !== 'undefined' && evt.rruleType !== null)
const isNotRecurringEvent = (evt) => !isRecurringEvent(evt)
const dateBetween = (start, end, chkDate) => compareDesc(start, chkDate) >=0 && compareAsc(end, chkDate) >=0
let mergeArrays = (arrays) => [].concat.apply([], arrays)
//===============================================
//===============================================
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


//===============================================
//===============================================
//===============================================
const nextMonthlyEventDate = (evt) =>  {
    const dte = new Date(evt.startDate)
    // console.log('nextMonthlyEventDate:', dateDisp(dte), evt.rruleData);
    const frequency=parseInt(evt.rruleData,10)
    let nextMonth = addWeeks(dte, 4)
    if (nextMonth.getUTCMonth() === dte.getUTCMonth()) {
        nextMonth = addWeeks(nextMonth, 1)
    }
    var quotient = Math.floor(nextMonth.getDate()/ 7);
    var remainder = nextMonth.getDate() % 7;
    let minD = 7*(frequency-1)
    if ( quotient !== frequency && (nextMonth.getDate() <  minD || (quotient < 3 && remainder === 0))) {
        nextMonth = addWeeks(nextMonth, 1)
        quotient = Math.floor(nextMonth.getDate()/ 7);
        remainder = nextMonth.getDate() % 7;
    }
    return nextMonth
}

//-----------------------------------------------------------------------------
const expandRecurranceEvent = (evt, start, end, acc) => {
    if (compareDesc(end, evt.startDate) >= 0 ) {
        return acc
    }
    if ( dateBetween(start, end, evt.startDate)) {
        acc.push(Object.assign({}, evt, {startDate:new Date(evt.startDate)}))
    }
    switch (evt.freq) {
        case 'WEEKLY':
            // console.log('Expand WEEKLY event:', evt);
            const newWeeklyEvent = Object.assign({}, evt, {startDate:addWeeks(evt.startDate, 1)})
            return expandRecurranceEvent(newWeeklyEvent, start, end, acc)
        case 'MONTHLY':
            // console.log('Expand MONTHLY event:', evt);
            const nextByDay = nextMonthlyEventDate(evt)
            const newMonthlyEvent = Object.assign({}, evt, {startDate:new Date(nextByDay)})
            return expandRecurranceEvent(newMonthlyEvent, start, end, acc)
        default:
            console.log('**** UNK frequency to expand event:', evt);
    }
}
//===========================================
const getCalendarDataForMonth = (icalData, currDate) =>{
    if (icalData.length === 0) return [];

    const inLastWeekOfTheMonth = (date) => differenceInDays(endOfMonth(date), date ) < 7

    let startDate = startOfWeek(startOfMonth(currDate) );
    //remaining days of current month will still be displayed
    if (inLastWeekOfTheMonth(currDate) && endOfWeek(currDate).getMonth() !== currDate.getMonth()) {
        console.log('getCalendarDataForMonth:addMonth', endOfWeek(currDate), endOfWeek(currDate).getMonth() , currDate.getMonth());
        currDate  = addMonths(currDate,1)
        startDate = startOfWeek(startOfMonth(currDate) );
    }
    const endDate = endOfWeek(endOfMonth(currDate) );

    let calendarData=[]
    // console.log("icalData:", icalData);
    const recurringEvents = icalData.filter(isRecurringEvent)

    if (recurringEvents.length > 0) {
        // console.log("Init icalData:", icalData)
        const dateInRange = (chkDate) => dateBetween(startDate, endDate, chkDate)
        const eventInRange = (evt) => dateInRange(evt.startDate) || dateInRange(evt.endDate)
        const expandEvent = (evt) => expandRecurranceEvent(evt, startDate, addDays(endDate, -1), [])

        // console.log("Expanded Evts:", icalData.filter(isRecurringEvent).map(expandEvent))
        calendarData = mergeArrays(icalData.filter(isRecurringEvent).map(expandEvent))
        .concat(icalData.filter(isNotRecurringEvent).filter(eventInRange))

        calendarData = calendarData.map((evt, index)=>{
            evt.id = index;
            evt.startDate = new Date(evt.startDate)
            // evt.startDate = new Date(evt.recurrenceID || evt.startDate)
            return evt;
        })
        const movedEvents = calendarData.filter(evt => evt.recurrenceID !== null )

        // filter out the calendarData events that are the original copies of events that were movedEvents
        calendarData = calendarData.filter((evt) => {
            const chk=movedEvents.filter(moved => moved.googleId === evt.googleId).length
            return !chk || evt.recurrenceID !== null
        })
        calendarData = calendarData.filter((evt) => evt.startDate - addWeeks(currDate, -1)  > 0)
    }
    // console.log('calendarData:', calendarData);
    return calendarData
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
    // calendarProcess(2000, false, 0)

}

// =================================================
module.exports.calendarProcess = calendarProcess;
module.exports.getCalendarDataForMonth = getCalendarDataForMonth;

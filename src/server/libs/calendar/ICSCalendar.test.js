var {pullTranslatedEventsFromICS, getCalendarDataForRange,
    pullEventsFromDB, pullAgendaIDFromDB, icsEventToDBRecord,
} = require('./ICSCalendar')
var startOfMonth = require('date-fns/start_of_month');
var {getHomeCalendarDateRange} = require('../date')

var {addOrUpdateTable, getKnexConnection} = require('../db/common');

var knexConnection = getKnexConnection()
// =================================================
const fieldNames = (events) =>
    {    const rruleFieldNames = mergeArrays(events.filter(evt=> evt.rrule ).map(evt=>Object.keys(evt.rrule) ))
        .filter(onlyUnique)
        .map(fieldName=>'rrule_'+fieldName)

        const mainFieldNames =  mergeArrays(events.map(evt=>Object.keys(evt))).filter(onlyUnique)
        console.log('rrule fieldNames', rruleFieldNames);
        console.log('main fieldNames', mainFieldNames );
        console.log('fieldNames', mainFieldNames.concat(rruleFieldNames) );
    }
// =================================================
if (require.main === module) {
    const range = getHomeCalendarDateRange()
    console.log(range);
    const now = new Date()
    // const now = addMonths(new Date(), -1)
    const monthStart = startOfMonth(now)

    return pullTranslatedEventsFromICS('file:///home/dcarpus/Downloads/export.ics')
    .then(events=> {// addDays(new Date(), -7),addDays(new Date(), 28)
        return Promise.all(events
            .slice(0, 50)
            .map(evnt=> {
                delete evnt.complex
                const dbRec = icsEventToDBRecord(evnt)
                // return Promise.resolve(evnt)
                return addOrUpdateTable(knexConnection, 'CalendarEvents',
                dbRec,{ uid: dbRec.uid, startDate: dbRec.startDate})
            })
        )
    })
    .then(migratedEvents=> {
        console.log(' *** migratedEvents', migratedEvents.length);
        return pullTranslatedEventsFromICS('file:///home/dcarpus/Downloads/export.ics')
        .then(events=> {
            // console.log('"Home" events', events.filter(evt=>evt.pageLink === 'Home').map(evt=>evt.summary).filter(onlyUnique).sort());
            // console.log('Non "PublicMeeting" events', events.filter(evt=>evt.eventType !== 'Public Meeting').map(evt=>evt.summary).filter(onlyUnique).sort());
            const addAgendaIDFromDB = (evt) => {
                return pullAgendaIDFromDB(evt.pageLink, evt.startDate).then(id=> {
                    return Promise.resolve(Object.assign({}, evt, {agendaID:id}))
                })
            }

            return Promise.all(events.map(addAgendaIDFromDB))
            // console.log('"NON-Home" events',
            // events.filter(evt=>evt.pageLink !== 'Home' && evt.eventType === 'Public Meeting')
            // .map(evt=>evt.pageLink +'-'+ evt.eventType +'-'+ evt.summary).filter(onlyUnique).sort());
        })
        .then(events=> {
            console.log('events with Agendas:', events.filter(evt=>evt.agendaID)
                .slice(0, 10)
                .map(evt=>({summary:evt.summary, startDate:evt.startDate, agendaID:evt.agendaID}))
                , 'showing 10 of ', events.filter(evt=>evt.agendaID).length
            );
        })
    })

    .then(()=> {
        process.exit()
    })
    .catch(err=>
        console.log('X err',err)
    )
}

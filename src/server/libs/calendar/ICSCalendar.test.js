//========================================
const testGetDayOfMonth = () => {
    const out = console.log
    const startDate = new Date('2018-01-27T00:00:00.000Z')
    out('startDate:',startDate);
    let fetch = {}
    fetch = {dow:3, weekNum:2}
    out('---\n',getDayOfMonth(startDate, fetch.dow, fetch.weekNum ));
    fetch = {dow:3, weekNum:3}
    out('---\n',getDayOfMonth(startDate, fetch.dow, fetch.weekNum ));
    fetch = {dow:5, weekNum:2}
    out('---\n',getDayOfMonth(startDate, fetch.dow, fetch.weekNum ));
    fetch = {dow:5, weekNum:3}
    out('---\n',getDayOfMonth(startDate, fetch.dow, fetch.weekNum ));
    fetch = {dow:6, weekNum:2}
    out('---\n',getDayOfMonth(startDate, fetch.dow, fetch.weekNum ));
    fetch = {dow:0, weekNum:1}
    out('---\n',getDayOfMonth(startDate, fetch.dow, fetch.weekNum ));
}
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
    // testWebPull()
    const monthStart = startOfMonth(Date())
    // const endDate = addMonths(new Date(), 1)
    const endDate = endOfMonth(new Date())
    console.log('=================');
    console.log(getHomeCalendarRange());
    getCalendarDataForRange(monthStart, endDate)
    // pullEventsFromICS('file:///home/dcarpus/Downloads/export.ics')
    // .then((events)=> {
    //     return  events.map(evt=>
    //         Object.assign({},
    //             {
    //                 uid: evt.uid,
    //                 startDate: evt.startDate,
    //               endDate: evt.endDate,
    //               summary: evt.summary,
    //               description: evt.description,
    //               location: evt.location,
    //               created: evt.created,
    //               modifiedDate: evt.modifiedDate,
    //               elapsed: evt.elapsed,
    //             }
    //             , evt.rrule?
    //             {
    //                 rrule_FREQ: evt.rrule.FREQ,
    //                 rrule_UNTIL: evt.rrule.UNTIL,
    //                 rrule_INTERVAL: evt.rrule.INTERVAL,
    //                 rrule_BYMONTHDAY: evt.rrule.BYMONTHDAY,
    //                 rrule_WKST: evt.rrule.WKST,
    //                 rrule_BYDAY: evt.rrule.BYDAY,
    //                 rrule_COUNT: evt.rrule.COUNT,
    //                 rrule_BYMONTH: evt.rrule.BYMONTH
    //             }
    //             :{}
    //         ) // end Object.assign
    //     );
    //
    // })
    .then((dbEntries)=> {
        const insertFunc = (evt) => insertEventIntoDatabase(knexConnection, evt)
        console.log('dbEntries',dbEntries.length);
        // return Promise.all( dbEntries.map( insertFunc) )
    })
    .then(()=> {
        process.exit()
    })
    .catch(err=>
        console.log('X err',err)
    )
}
// =================================================
// const isKeyEvt = (evt) => evt.uid.indexOf('.8663')>0
// const isKeyEvt = (evt) => evt.uid.indexOf('.18973')>0

// pullEventsFromDB(range[0],range[1])
// .then(dbEntries=> {
//     console.log('dbEntries From DB',require('util')
//     .inspect(dbEntries.filter(isKeyEvt), { depth: null }));
//     return Promise.resolve(dbEntries)
//     // console.log('dbEntries',dbEntries);
// })
// // getCalendarDataForRange(startOfMonth(Date()), endOfMonth(new Date()))
// .then( ()=> {
    // console.log('pullEventsFromICS');
    // return pullTranslatedEventsFromICS('file:///home/dcarpus/Downloads/export.ics')
    // return pullEventsFromICS('file:///home/dcarpus/Downloads/export.ics')
    // .then((events)=> {
    //     return  Promise.all(events.map(evt=>{
    //         if (isKeyEvt(evt)) {
    //             console.log('From ICS:');
    //             console.log('evt',require('util').inspect(evt, { depth: null }));
    //             console.log('asDBRecord:');
    //             console.log(require('util').inspect(icsEventToDBRecord(evt), { depth: null }));
    //         }
    //         // const insertFunc = (evt) => insertEventIntoDatabase(knexConnection, evt)
    //         // return insertFunc(icsEventToDBRecord(evt))
    //         return Promise.resolve(icsEventToDBRecord(evt))
    //     }))
    // })
    // .then(fromICS=> {
    //     console.log('dbRecords from DB:')
    //     return  pullEventsFromDB(range[0],range[1])
    //     .then(dbRecords=> {
    //         console.log(require('util').inspect(dbRecords.filter(isKeyEvt), { depth: null }));
    //         // console.log(require('util').inspect(dbRecords, { depth: null }));
    //     // console.log('dbRecords',dbRecords);
    //     })
    // })

// })

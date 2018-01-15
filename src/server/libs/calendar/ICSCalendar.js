/*
Processing of RFC 5455 based data
*/
var Config = require('../../config'),
configuration = new Config();

var fetchURL = require('../../db/webMigrate/serverIO').fetchURL;
var addOrUpdateTable = require('../db/common').addOrUpdateTable;

var icalendar = require('icalendar');

var startOfMonth = require('date-fns/start_of_month');
var endOfMonth = require('date-fns/end_of_month');
var startOfWeek = require('date-fns/start_of_week');
var endOfWeek = require('date-fns/end_of_week');
var isWithinRange = require('date-fns/is_within_range')
var addDays = require('date-fns/add_days')

const privateDir = '../private/'+process.env.REACT_APP_MUNICIPALITY;

const translations = require(configuration.ROOT_DIR+'/'+privateDir + '/ICSCalendarLookups.json')

var knexConfig = require('../db/knexfile.js')
var knexConnection = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

//========================================
const dateAbbreviations = [{abbr:'SU', num:0},
    {abbr:'MO', num:1},        {abbr:'TU', num:2},         {abbr:'WE', num:3},
    {abbr:'TH', num:4},        {abbr:'FR', num:5},          {abbr:'SA', num:6},
]
const dateNum = (dateAbbr) => dateAbbreviations.filter(rec=>rec.abbr === dateAbbr)[0].num
const dateAbbr = (dateNum) => dateAbbreviations.filter(rec=>rec.num === dateNum)[0].abbr
const dateFromICSDateStr = (datestr) => datestr? new Date(datestr.substring(0,4)+ '-' + datestr.substring(4,6) + '-' + datestr.substring(6,8) +
 'T' + datestr.substring(9,11) + ':' + datestr.substring(11,13)  + ':' + datestr.substring(13,15) + "Z")
 :null
//========================================
const getDayOfMonth = (baseDate, day , week) => {
    let firstOfMonth = new Date(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), 1)
    let firstSunOfMonth = addDays(firstOfMonth, 7-firstOfMonth.getDay())
    const chk = (week - 1)*7 + firstSunOfMonth.getDate() + day - (day>= firstOfMonth.getDay()?7:0)

    return new Date(baseDate.getFullYear(), baseDate.getMonth(),chk,
        baseDate.getHours(), baseDate.getMinutes())
}
// ==========================================================
//===========================================
const mergeArrays = (arrays) => [].concat.apply([], arrays)
const onlyUnique = (value, index, self) => self.indexOf(value) === index;
//===========================================
function insertEventIntoDatabase(knex, eventToinsert) {
    return addOrUpdateTable(knex, 'CalendarEvents',
    eventToinsert,{ uid: eventToinsert.uid, startDate: eventToinsert.startDate})
}
// =================================================
// =================================================
const translateSummary = (originalSummary) => {
    let summaries = translations.summaries
    const ucaseLine = originalSummary.toUpperCase()
    let matches = summaries.filter(type => {  //  type.alts
        return  (type.summary === ucaseLine) || type.alts.reduce(function(sum, value) {
            return sum || (ucaseLine.search(new RegExp(value, 'i')) >= 0);
        }, false);
    })
    if (matches.length > 0) {
        return  matches[0].summary
    }
    return originalSummary
}
// =================================================
const computeEventType = (summary, pageLink) => {
    // console.log('Unknown eventType: ', pageLink, summary);
    if(summary.toLowerCase().endsWith(' training')) return "Event"
    if(summary.toLowerCase().indexOf(' scout') > -1) return "Community Event"
    if(summary.toLowerCase().indexOf(' fundraiser') > -1) return "Event"
    if(summary.toLowerCase().indexOf(' benefit') > -1) return "Event"
    if(summary.toLowerCase().indexOf(' open house') > -1) return "Event"
    if(summary.toLowerCase().indexOf(' blood drive') > -1) return "Event"
    if(summary.toLowerCase().indexOf(' celebration') > -1) return "Event"

    if(summary.toLowerCase().indexOf('public hearing') > -1) return "Public Meeting"

    if (pageLink !== 'Home') {
        return "Public Meeting"
    }

    if(summary.toLowerCase().endsWith(' class')) return "Community Event"

    console.error('Unknown eventType: ', summary);
    return "Community Event"
    // return "Event"
    // ["Holiday",     "Public Meeting"    ]
}
// =================================================
const computePageLink = (URI, summary) => {
    let pageLink = translateURIDept(URI)
    if(pageLink === 'Home' && summary){
        const pageLinkFromSummary = translateSummaryDept(summary)
        if(pageLinkFromSummary) pageLink = pageLinkFromSummary
    }
    return pageLink
}

// =================================================
const translateURIDept = (URI) => {
    const pageLink = URI.split('/')[3]
    let matches = translations.groupFromURI.filter(group => group.URI === pageLink )
    return (matches.length > 0)? matches[0].group: pageLink
}
// =================================================
const translateSummaryDept = (summary) => {
    let matches = translations.groupFromSummary.filter(group => group.summary === summary )
    return (matches.length > 0)? matches[0].group: null
}
// =================================================
function translateEventFromICal(evt) {
    const origEvt = Object.assign({},evt)
     let endDate = evt.endDate
     if (evt.rrule ) {
         endDate =  evt.rrule.UNTIL
         evt.freq = evt.rrule.FREQ
         evt.interval = evt.rrule.INTERVAL
         if (evt.rrule.BYMONTHDAY) {
             evt.freqType = "BYMONTHDAY"
             evt.freqData = evt.rrule.BYMONTHDAY
             evt.byMonthDay = evt.rrule.BYMONTHDAY
             evt.complex = true
         }
         if (evt.rrule.BYMONTH) {
             evt.complex = true
             evt.freqType = "BYMONTH"
             evt.freqData = evt.rrule.BYMONTH
             evt.months = evt.rrule.BYMONTH.split(',').map(month=>parseInt(month))
             evt.count = parseInt(evt.rrule.COUNT)
         }
         if (evt.rrule.BYDAY) {
             evt.complex = true
             evt.freqType = "BYDAY"
             evt.freqData = evt.rrule.BYDAY
             evt.byDay = evt.rrule.BYDAY.replace('+','')
         }
         delete evt.rrule.BYMONTHDAY
         delete evt.rrule.BYMONTH
         delete evt.rrule.BYDAY
         delete evt.rrule.COUNT
         delete evt.rrule.UNTIL
         delete evt.rrule.FREQ
         delete evt.rrule.INTERVAL

         if (Object.keys(evt.rrule).length > 1) {
             console.log('complex RRULE', '\n---\n', Object.keys(evt.rrule),
                '\n---origEvt\n',origEvt, '\n---evt\n',evt);
             throw("Unable to process complex RRULE",origEvt)
         }
         if (Object.keys(evt.rrule)[0] === 'WKST') {
             evt.weekStart = evt.rrule['WKST']
         } else {
             throw("Unknown rule type",evt.rruleType)
         }
     }
     delete evt.rrule
     if (evt.location.length === 0) { delete evt.location }
     if (evt.description.length === 0) { delete evt.description }
     if (!evt.recurrenceID || evt.recurrenceID.length === 0) { delete evt.recurrenceID }

     if (evt.location) {
         // console.log('evt.location',evt.location);
         evt.location = evt.location.split('\n').map(locLine=>locLine.trim()).join('\n')
         .replace('See map: Google Maps','')
         .replace('United States','')
         .replace('New Durham ,               NH','New Durham, NH')
             .trim()
      }
      if (evt.summary) {
          evt.summary = translateSummary(evt.summary)
      }
      evt.pageLink = computePageLink(evt.URI, evt.summary)
      evt.eventType = computeEventType(evt.summary, evt.pageLink)

     evt.endDate = endDate

    return evt
}
// =================================================
function pullEventsFromDB( startDate, endDate ){
    return knexConnection("CalendarEvents").select('*').where('endDate', '>', startDate).orWhereNull('endDate')
    .then(results => results.map(dbRecordToICSEvent))
}
// =================================================
function pullAgendaIDFromDB( pageLink, startDate ){
    const date1 = addDays(startDate, -1)
    const date2 = addDays(startDate, 1)

    return knexConnection("PublicRecords").select('*').whereBetween('date', [date1, date2])
    .andWhere("recordtype", 'Agenda' ).andWhere("pageLink", pageLink )
    .then(results => {
        if(results.length === 1){
            // console.log('results',pageLink, startDate, results[0].id);
            return Promise.resolve(results[0].id)
        } else {
            return Promise.resolve(undefined)
        }
    })
}

// =================================================
function pullTranslatedEventsFromICS( icsURL ){
    return pullEventsFromICS( icsURL )
    .then(events=> Promise.resolve(events.map( translateEventFromICal)) )
}
// =================================================
function pullEventsFromICS( icsURL ){
    let mergeArrays = (arrays) => [].concat.apply([], arrays)
    const onlyUnique = (value, index, self) => self.indexOf(value) === index;

    return fetchURL(icsURL)
    .then( (data) => {
        var ical = icalendar.parse_calendar(data.data);
        return ical.events()
    }).then(icalEvents => {
        return icalEvents.map(evt =>{
            const props = evt.properties
            // console.log('props',props);
            const location = props.LOCATION ?
            props.LOCATION[0].value.split('\n').map(locLine=>locLine.trim()).join('\n')
            .replace('See map: Google Maps','')
            .replace('United States','')
            .replace('New Durham ,               NH','New Durham, NH')
                .trim()
                : ''
            const icalObj = {
                uid: props.UID[0].value,
                startDate:props.DTSTART[0].value, endDate: props.DTEND[0].value,
                status: props.STATUS ? props.STATUS[0].value:"",
                summary: props.SUMMARY[0].value,
                description: props.DESCRIPTION ? props.DESCRIPTION[0].value : "",
                location: location,
                created: props.CREATED[0].value,
                modifiedDate: props['LAST-MODIFIED'][0].value,
                elapsed:  (props.DTEND[0].value -  props.DTSTART[0].value),
                URI:  props.URL ? props.URL[0].value : "",
            }
            if(props.RRULE) icalObj.rrule = props.RRULE[0].value
            if(props.SEQUENCE) icalObj.sequence = props.SEQUENCE[0].value
            if(props['RECURRENCE-ID']) icalObj.recurrenceID = props['RECURRENCE-ID'][0].value

            if(icalObj.rrule && icalObj.rrule.UNTIL) icalObj.rrule.UNTIL = dateFromICSDateStr(icalObj.rrule.UNTIL)

            if (props.RRULE && props.RRULE.length > 1) {
                throw new Error('Multiple RRules for event.')
            }
            return icalObj;
        })
    })
}
// =================================================
function extractICSWeeklyDates(startDate, endDate, icsRecord) {
    if(!isWithinRange(icsRecord.startDate, startDate, endDate) &&
    !isWithinRange(icsRecord.endDate, startDate, endDate)){
        return []
    }
    switch (icsRecord.freqType) {
        case 'BYDAY':
        const weekCnt = differenceInCalendarWeeks(icsRecord.endDate,  icsRecord.startDate)+1
        return Array.apply(null, Array(weekCnt))
            .map(function (x, y) { return addWeeks(icsRecord.startDate, y)})
            .filter(date=> isWithinRange(date, startDate, endDate))
        break;
        default:
            throw new Error('extractICSWeeklyDates:unprocessed freqType:'+ icsRecord.freqType );
    }
    return []
}
// =================================================
function extractICSMonthlyDates(startDate, endDate, icsRecord) {
    switch (icsRecord.freqType) {
        case 'BYMONTHDAY':
            if(!isWithinRange(icsRecord.startDate, startDate, endDate) &&
            !isWithinRange(icsRecord.endDate, startDate, endDate)){
                return null
            }
            if (icsRecord.freqData === '1' && icsRecord.interval === '1' ) {
                if(!isWithinRange(icsRecord.startDate, startDate, endDate)) return []
                return [icsRecord.startDate]
            }
            break;
        case 'BYMONTH':
            const monthCnt = differenceInCalendarMonths(endDate,  icsRecord.startDate)+1
            if (!icsRecord.byDay ) {
                console.error(icsRecord);
                throw new Error("Missing icsRecord.byDay" )
            }
            if ( icsRecord.byDay.length < 3) {
                throw new Error("icsRecord.byDay.length < 3:"+icsRecord.byDay.length )
            }
            const targetWeek = parseInt(icsRecord.byDay.substring(0,1))
            const targetDay  = dateNum(icsRecord.byDay.substring(1))
            const months = differenceInCalendarMonths(endDate,  icsRecord.startDate)

            return ((months>=0)? Array.apply(null, Array(months)):[])
                .map(function (x, y) { return addMonths(icsRecord.startDate, y)})
                .map(date=> getDayOfMonth(date, targetDay, targetWeek ))
                .filter(date=> isWithinRange(date, startDate, endDate))
            break;
        case 'BYDAY':
            const pivotMonth = icsRecord.startDate.getMonth()+1
            return  icsRecord.months.slice(icsRecord.months.indexOf(pivotMonth))
                .concat(icsRecord.months.slice(0, icsRecord.months.indexOf(pivotMonth)))
                .map(month=>month<pivotMonth? 12-(pivotMonth-month):month-pivotMonth)
                .map(month=> addMonths(icsRecord.startDate, month))
                .map(date=> getDayOfMonth(date, dateNum(icsRecord.byDay.substring(1)), parseInt(icsRecord.byDay.substring(0,1)) ))
                .filter(date=> icsRecord.months.includes(date.getMonth()+1) )
                .slice(0,icsRecord.count)
        default:
            console.log('extractICSMonthlyDates:unprocessed freqType:', icsRecord.freqType );
    }
    return icsRecord
}
// =================================================
function extractICSEventDates(startDate, endDate, icsRecord) {
    // if(icsRecord.uid.indexOf('.8953.') >0) console.log('icsRecord', icsRecord);
    if (typeof icsRecord.freq === 'undefined') { // Non recurring
        return isWithinRange(icsRecord.startDate, startDate, endDate)? [icsRecord.startDate]: []
    }
    return isWithinRange(icsRecord.startDate, startDate, endDate)? [icsRecord.startDate]: []
    // TODO: Currently NOT extracting as only town (New Durham) does not output correct recurrances

    switch (icsRecord.freq) {
        case 'MONTHLY':
            return  extractICSMonthlyDates(startDate, endDate, icsRecord)
            .filter(date=>isWithinRange(date, startDate, endDate))
            break;
        case 'WEEKLY':
            return extractICSWeeklyDates(startDate, endDate, icsRecord)
            .filter(date=>isWithinRange(date, startDate, endDate))
            break;
        default:
            console.log('extractICSEventDates:', icsRecord);
            return [icsRecord.startDate]
    }
}
// =================================================
function getCalendarDataForRange(startDate, endDate) {
    if (configuration.municipalLongName === 'New Durham') {
        const icsPath = 'file://' + configuration.ROOT_DIR+'/'+privateDir + '/export.ics'
        console.log('icsPath',icsPath);
        return pullTranslatedEventsFromICS(icsPath)
        .then(evts=> {
            return evts
            .filter(evt=>isWithinRange(evt.startDate, startDate, endDate))
            .map(evt=> ({
                startDate:evt.startDate,
                summary:evt.summary,
                location:evt.location,
                elapsed:evt.elapsed,
                uid:evt.uid,
                pageLink:evt.pageLink,
                eventType:evt.eventType,
            }))
        })
    } else {
        return Promise.reject("getCalendarDataForRange:Processing of DB based calendar events TBD.")
    }

}
// =================================================
function getHomeCalendarRange() {
    const pivot = new Date()
    return [startOfWeek(startOfMonth(pivot)), endOfWeek(endOfMonth(pivot))]
}

// =================================================
const dbRecordToICSEvent = (rec)=>{
    let result = Object.assign({}, rec )
    result.rrule = Object.keys(result).filter(key=>key.startsWith('rrule_'))
    .reduce( (acc,curr, i) => {
        acc[curr.replace('rrule_', '')] = rec[curr]
        delete result[curr]
        return acc
    }, {})

    return result
}
 // =================================================
const icsEventToDBRecord = (evt) => {
    let record = Object.assign({},
        {
            uid: evt.uid,
            startDate: evt.startDate,            endDate: evt.endDate,
            summary: evt.summary,            description: evt.description,
            location: evt.location,
            created: evt.created,            modifiedDate: evt.modifiedDate,
            elapsed: evt.elapsed,
            URI: evt.URI,
        }
        , evt.rrule?
        {
            rrule_FREQ: evt.rrule.FREQ,
            rrule_UNTIL: evt.rrule.UNTIL,
            rrule_INTERVAL: evt.rrule.INTERVAL,
            rrule_BYMONTHDAY: evt.rrule.BYMONTHDAY,
            rrule_WKST: evt.rrule.WKST,
            rrule_BYDAY: evt.rrule.BYDAY,
            rrule_COUNT: evt.rrule.COUNT,
            rrule_BYMONTH: evt.rrule.BYMONTH
        }
        :{}
    )
    if (record.location) {
        record.location = record.location.split('\n').map(locLine=>locLine.trim()).join('\n')
        .replace('See map: Google Maps','').replace('United States','').replace('New Durham ,               NH','New Durham, NH')
        .trim()
     }
     if (record.summary) {
         record.summary = translateSummary(record.summary)
     }
     record.pageLink = computePageLink(record.URI, record.summary)
     record.eventType = computeEventType(record.summary,record.pageLink)

     return record
}
// =================================================
if (require.main === module) {

    const range = getHomeCalendarRange()
    console.log(range);
    const now = new Date()
    // const now = addMonths(new Date(), -1)
    const monthStart = startOfMonth(now)
    getCalendarDataForRange(range[0], range[1])
    // return pullEventsFromICS('file:///home/dcarpus/Downloads/export.ics')
    // return pullTranslatedEventsFromICS('file:///home/dcarpus/Downloads/export.ics')
    .then(events=> {
        // console.log('"Home" events', events.filter(evt=>evt.pageLink === 'Home').map(evt=>evt.summary).filter(onlyUnique).sort());
        // console.log('events', events.length);
        // console.log('Non "PublicMeeting" events', events.filter(evt=>evt.eventType !== 'Public Meeting').map(evt=>evt.summary).filter(onlyUnique).sort());
        // console.log('events', events);
        const addAgendaIDFromDB = (evt) => {
            return pullAgendaIDFromDB(evt.pageLink, evt.startDate).then(id=> {
                console.log('got id', id);
                return Promise.resolve(Object.assign({}, evt, {agendaID:id}))
            })
        }

        return Promise.all(events.map(addAgendaIDFromDB))
        // console.log('"NON-Home" events',
        // events
        // .filter(evt=>evt.pageLink !== 'Home' && evt.eventType === 'Public Meeting')
        // .map(evt=>evt.pageLink +'-'+ evt.eventType +'-'+ evt.summary).filter(onlyUnique).sort());

        // console.log('event pageLinks', events.map(evt=>evt.pageLink).filter(onlyUnique).sort());
    })
    .then(events=> {
        console.log('events with Agendas:', events.filter(evt=>evt.agendaID));
    })

    .then(()=> {
        process.exit()
    })
    .catch(err=>
        console.log('X err',err)
    )
}

// =================================================
// module.exports.calendarProcess = calendarProcess;
module.exports.getCalendarDataForRange = getCalendarDataForRange;
module.exports.getHomeCalendarRange = getHomeCalendarRange;
module.exports.pullEventsFromICS = pullEventsFromICS;
module.exports.icsEventToDBRecord = icsEventToDBRecord;
module.exports.pullAgendaIDFromDB = pullAgendaIDFromDB;

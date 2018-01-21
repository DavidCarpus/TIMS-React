var startOfMonth = require('date-fns/start_of_month');
var  startOfWeek = require( 'date-fns/start_of_week');
var  endOfMonth = require( 'date-fns/end_of_month');
var  endOfWeek = require( 'date-fns/end_of_week');
var addDays = require( 'date-fns/add_days');
var addHours = require( 'date-fns/add_hours');
var isSameDay = require( 'date-fns/is_same_day');

var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];

var monthAbbreviations = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
];

//-----------------------------------------------------------------------------
const dateArray = (start , end) =>{
    let date = start;
    let results = []
    while (date < end) {
        results.push(date)
        date = addDays(date, 1)
    }
    return results
}
//-----------------------------------------------------------------------------
const timeStampFromDate = (date) => (date.getHours()+date.getMinutes()+date.getSeconds() > 0) ?
(date.getHours() > 12 ? ""+(date.getHours()-12): (date.getHours()))  + ":" +
(date.getMinutes() < 10 ? "0" + date.getMinutes(): date.getMinutes())  +
(date.getHours() > 12 ? ' PM': ' AM'):
""
//-----------------------------------------------------------------------------
const weekOfMonth = (date) => {
    const dayOfWeekForFirstOfMonth = (new Date(date.getUTCFullYear(), date.getUTCMonth(), 1)).getDay()
    return  Math.floor((date.getDate()+dayOfWeekForFirstOfMonth)/7) + (((date.getDate()+dayOfWeekForFirstOfMonth)%7) > 0 ? 1: 0)
}
//-----------------------------------------------------------------------------
const onlyUnique = (value, index, self) => self.indexOf(value) === index;
//========================================
//========================================
function getInitialFilter() { return {"Public Meetings":true} }
//-----------------------------------------------------------------------------
function  getDisplayFiltersFromEvents(events) {
    return events.map(evt=>evt.eventType+"s").filter(onlyUnique)
    .reduce( (acc, val)=> Object.assign(acc, {[val]:false}) ,{})
};
//-----------------------------------------------------------------------------
const filterEvents = (filter, evt) => Object.keys(filter).reduce( (acc, val)=> {
    switch (typeof filter[val]) {
        case 'boolean':
        return acc ||  (evt.eventType === val.substr(0, val.length-1) &&  filter[val])

        case 'object':{
            switch (val) {
                case "startDateGT": return acc && (evt.startDate > filter[val])
                default:
                console.log('Unknown val:' + filter[val] + ' for filter[val]', val, filter);
            }
            return acc
        }
        default:
        console.log('Unknown type for filter[val]', filter[val], typeof filter[val]);
    }
    return acc
    // return acc ||  (evt.eventType === val.substr(0, val.length-1) &&  filter[val])
}, false)
//-----------------------------------------------------------------------------
const eventMatchesDate = (date, evt) => isSameDay(new Date(evt.startDate), date )
//-----------------------------------------------------------------------------
const  getEventsMonthNum = (events) => events.length<= 0? -1:
    Math.floor( events.reduce( (acc,val) => acc+val.startDate.getUTCMonth() ,0 )/events.length)

//-----------------------------------------------------------------------------
//========================================
function getSortedAndFilteredCalendarData(calendarData, filter) {
    return (calendarData.length > 0) ? calendarData.sort( (a,b)=> a.startDate - b.startDate)
    // .filter(evt=>filterEvents(filter, evt)).filter(evt=>evt.startDate > addWeeks(new Date(), -1) ): []
    .filter(evt=>filterEvents(filter, evt)): []
}
//-----------------------------------------------------------------------------
function  getEventsMonth(events) {return getMonthFromNum(getEventsMonthNum(events))}
function  getMonthFromNum(num) {
    while (num < 0) { num += 12 }
    return monthNames[num]
}
//-----------------------------------------------------------------------------
function getCalByWeek(rawEvents, filter){
    const events = getSortedAndFilteredCalendarData(rawEvents, filter)
    if (events.length <= 0)  return []

    let monthNum = getEventsMonthNum(events)
    while (monthNum < 0)  monthNum += 12

    const firstOfMonth = new Date(events[0].startDate.getUTCFullYear(), monthNum, 1)
    return dateArray( startOfWeek(startOfMonth(firstOfMonth) ), endOfWeek(endOfMonth(firstOfMonth)) )
    .map(date => {
        const isPrevMonth = (date) => (date-startOfMonth(firstOfMonth) ) < 0
        const isNextMonth = (date) => (date-endOfMonth(firstOfMonth) ) > 0
        return {
            week: isPrevMonth(date)? 1: (isNextMonth(date)?weekOfMonth(addHours(endOfMonth(firstOfMonth), -6)): weekOfMonth(date)),
            date:date,
            events: events.filter( event => eventMatchesDate(date, event) )
        }
    })
    .reduce( (acc, value) => {
        const key = value.week
        if ((typeof acc[key] === 'undefined')) { acc[key] = [] }
        acc[key].push(value)
        return acc
    }, [])
}
//-----------------------------------------------------------------------------
function  getEventList(rawEvents, filter) {
    const events = getSortedAndFilteredCalendarData(rawEvents, filter)
    if (events.length <= 0) return []
    return events.map(evt => ({
        dateStr: monthAbbreviations[evt.startDate.getMonth()] + ' ' + evt.startDate.getDate(),
        timestamp: timeStampFromDate(evt.startDate) +
        (timeStampFromDate(evt.startDate).length > 0 && timeStampFromDate(evt.endDate).length > 0?'-':" ") +
        timeStampFromDate(new Date(evt.endDate)),
        id:evt.uid,
        // agendaID: evt.publicRecords ? evt.publicRecords.id: null,
        description:evt.summary,
        sdate: evt.startDate,
        eventType:evt.eventType,
        agendaID:evt.agendaID,
    }))
}

module.exports.getInitialFilter = getInitialFilter;
module.exports.getDisplayFiltersFromEvents = getDisplayFiltersFromEvents;
module.exports.getSortedAndFilteredCalendarData = getSortedAndFilteredCalendarData;
module.exports.getEventsMonth = getEventsMonth;
module.exports.getCalByWeek = getCalByWeek;
module.exports.getEventList = getEventList;
module.exports.getMonthFromNum = getMonthFromNum;

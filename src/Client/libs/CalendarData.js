import  startOfMonth from 'date-fns/start_of_month';
import  startOfWeek from 'date-fns/start_of_week';
import  endOfMonth from 'date-fns/end_of_month';
import  endOfWeek from 'date-fns/end_of_week';
import addDays from 'date-fns/add_days';
import addWeeks from 'date-fns/add_weeks';
import addMonths from 'date-fns/add_months';
import getISOWeek from 'date-fns/get_iso_week';
import isSameDay from 'date-fns/is_same_day';
import differenceInCalendarMonths from 'date-fns/difference_in_calendar_months';

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
const onlyUnique = (value, index, self) => self.indexOf(value) === index;
//========================================
//========================================
export function getInitialFilter() { return {"Public Meetings":true} }
//-----------------------------------------------------------------------------
export function  getDisplayFiltersFromEvents(events) {
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
const getEventsMonthNum = (events)=> (events.length <= 0) ? -1:
addMonths(events[0].startDate,Math.abs(differenceInCalendarMonths(events[0].startDate,events[events.length-1].startDate))/2).getMonth()
//-----------------------------------------------------------------------------
//========================================
export function getSortedAndFilteredCalendarData(calendarData, filter) {
    return (calendarData.length > 0) ? calendarData.sort( (a,b)=> a.startDate - b.startDate)
    .filter(evt=>filterEvents(filter, evt)).filter(evt=>evt.startDate > addWeeks(new Date(), -1) ): []
}
//-----------------------------------------------------------------------------
export function  getEventsMonth(events) {return monthNames[getEventsMonthNum(events)]}
//-----------------------------------------------------------------------------
export function getCalByWeek(rawEvents, filter){
    const events = getSortedAndFilteredCalendarData(rawEvents, filter)
    if (events.length <= 0) return []
    // console.log('getCalByWeek', rawEvents.length, events.length);
    const firstOfMonth = new Date(events[0].startDate.getFullYear(), getEventsMonthNum(events), 1)
    return dateArray( startOfWeek(startOfMonth(firstOfMonth) ), endOfWeek(endOfMonth(firstOfMonth)) )
    .map(date => ({
        week: getISOWeek(addDays(date,1)),
        date:date,
        events: events.filter( event => eventMatchesDate(date, event) )
    }))
    .reduce( (acc, value) => {
        const key = value.week < 8 ? value.week+52 :  value.week
        if ((typeof acc[key] === 'undefined')) { acc[key] = [] }
        acc[key].push(value)
        return acc
    }, [])
}
//-----------------------------------------------------------------------------
export function  getEventList(rawEvents, filter) {
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

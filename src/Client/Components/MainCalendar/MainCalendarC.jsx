// import React from 'react';
import MainCalendar from './MainCalendar'
 import { connect } from 'react-redux'
import { fetchCalendarData } from '../../actions/CalendarData'
import  startOfMonth from 'date-fns/start_of_month'
import  startOfWeek from 'date-fns/start_of_week'
import  endOfMonth from 'date-fns/end_of_month'
import  endOfWeek from 'date-fns/end_of_week'
import addDays from 'date-fns/add_days'
import getISOWeek from 'date-fns/get_iso_week'
import isSameDay from 'date-fns/is_same_day'

// var monthNames = [
//   "January", "February", "March",
//   "April", "May", "June", "July",
//   "August", "September", "October",
//   "November", "December"
// ];

var monthAbbreviations = [
  "Jan", "Feb", "Mar",
  "Apr", "May", "Jun", "Jul",
  "Aug", "Sep", "Oct",
  "Nov", "Dec"
];

const dateArray = (start , end) =>{
    let date = start;
    let results = []
    while (date < end) {
        results.push(date)
        date = addDays(date, 1)
    }
    return results
}
const timeStampFromDate = (date) => (date.getHours()+date.getMinutes()+date.getSeconds() > 0) ?
    (date.getHours() > 12 ? ""+(date.getHours()-12): (date.getHours()))  + ":" +
    (date.getMinutes() < 10 ? "0" + date.getMinutes(): date.getMinutes())  +
    (date.getHours() > 12 ? ' PM': ' AM'):
    ""

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
const mapStateToProps = (state, ownProps) => {
    let recordState = state.CalendarData;

    let calendarData = recordState.CalendarData || [];
    calendarData = calendarData.map( evt=>{
        evt.startDate = new Date(evt.startDate)
        evt.endDate = (evt.endDate !== null) ? new Date(evt.endDate): null
       return evt;
    })

    const eventMatchesDate = (date, evt) => isSameDay(new Date(evt.startDate), date )
    let calDataByWeek = calendarData.length <=0 ? {}: dateArray(startOfWeek(startOfMonth(calendarData[0].startDate) ), endOfWeek(endOfMonth(calendarData[0].startDate) ))
        .map(date => (
            {week: getISOWeek(addDays(date,1)), date:date, events: calendarData.filter( event => eventMatchesDate(date, event) ) })
        )
        .reduce( (acc, value) => {
            if ((typeof acc[value.week] === 'undefined')) { acc[value.week] = [] }
            acc[value.week].push(value)
            return acc
        }, [])

    let eventList = calendarData.length <=0 ? {}: calendarData
        .sort( (a,b)=> a.startDate - b.startDate)
        .map(evt => {
            // const evtObj = {
            return {
                dateStr: monthAbbreviations[evt.startDate.getMonth()] + ' ' + evt.startDate.getDate(),
                timestamp: timeStampFromDate(evt.startDate) + (timeStampFromDate(evt.startDate).length > 0?'-':"") + timeStampFromDate(new Date(evt.endDate)),
                id:evt.id,
                agendaID: evt.publicRecords ? evt.publicRecords.id: null,
                description:evt.summary
            }
            // console.log('evt', evtObj);
        })

    return {
        calDataByWeek:calDataByWeek,
        eventList:eventList,
        group: ownProps.group,
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchData: () => {
         dispatch(fetchCalendarData())
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainCalendar);

// import React from 'react';
import MainCalendar from './MainCalendar'
 import { connect } from 'react-redux'
import { fetchCalendarData } from '../../actions/CalendarData'
import  startOfMonth from 'date-fns/start_of_month'
import  startOfWeek from 'date-fns/start_of_week'
import  endOfMonth from 'date-fns/end_of_month'
import  endOfWeek from 'date-fns/end_of_week'
import addDays from 'date-fns/add_days'
import addWeeks from 'date-fns/add_weeks'
import addMonths from 'date-fns/add_months'


import getISOWeek from 'date-fns/get_iso_week'
import isSameDay from 'date-fns/is_same_day'
import differenceInCalendarMonths from 'date-fns/difference_in_calendar_months'

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

    let eventList = {}
    let calDataByWeek = {}
    let monthName = ""

    const eventMatchesDate = (date, evt) => isSameDay(new Date(evt.startDate), date )
    if (calendarData.length > 0) {
        const oneWeekBack = addWeeks(new Date(), -1)
        let sortedCalendarData = calendarData.sort( (a,b)=> a.startDate - b.startDate)
        .filter(evt=>evt.startDate > oneWeekBack )

        const monthNum = addMonths(sortedCalendarData[0].startDate, Math.abs(differenceInCalendarMonths(
            sortedCalendarData[0].startDate,
            sortedCalendarData[sortedCalendarData.length-1].startDate))/2).getMonth()
        const year = sortedCalendarData[0].startDate.getFullYear()

        // console.log(sortedCalendarData, sortedCalendarData);
        const firstOfMonth = new Date(year, monthNum, 1)
        calDataByWeek = dateArray(
            startOfWeek(startOfMonth(firstOfMonth) ), endOfWeek(endOfMonth(firstOfMonth))
        )
        .map(date => ({
            week: getISOWeek(addDays(date,1)),
            date:date,
            events: sortedCalendarData.filter( event => eventMatchesDate(date, event) )
        }))
        .reduce( (acc, value) => {
            const key = value.week < 8 ? value.week+52 :  value.week
            // const key=value.week + ((value.week<8)?0:52)
            // const key=value.date.getFullYear() + value.week
            if ((typeof acc[key] === 'undefined')) { acc[key] = [] }
            acc[key].push(value)
            return acc
        }, [])
        console.log('calDataByWeek',calDataByWeek);

        eventList = sortedCalendarData.map(evt => ({
            dateStr: monthAbbreviations[evt.startDate.getMonth()] + ' ' + evt.startDate.getDate(),
            timestamp: timeStampFromDate(evt.startDate) +
                (timeStampFromDate(evt.startDate).length > 0 && timeStampFromDate(evt.endDate).length > 0?'-':" ") + 
                timeStampFromDate(new Date(evt.endDate)),
            id:evt.id,
            agendaID: evt.publicRecords ? evt.publicRecords.id: null,
            description:evt.summary,
            sdate: evt.startDate
        }))

        monthName = monthNames[monthNum]
    }


    return {
        calDataByWeek:calDataByWeek,
        eventList:eventList,
        monthName:  monthName,
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

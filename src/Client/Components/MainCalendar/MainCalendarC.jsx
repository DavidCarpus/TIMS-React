// import React from 'react';
import MainCalendar from './MainCalendar'
 import { connect } from 'react-redux'
import { fetchCalendarData } from '../../actions/CalendarData'
import  startOfMonth from 'date-fns/start_of_month'
import  endOfMonth from 'date-fns/end_of_month'
import  startOfWeek from 'date-fns/start_of_week'
import  endOfWeek from 'date-fns/end_of_week'
// import eachDay from 'date-fns/each_day'
import compareAsc from 'date-fns/compare_asc'
import compareDesc from 'date-fns/compare_desc'
import addDays from 'date-fns/add_days'
import addMonths from 'date-fns/add_months'
import addWeeks from 'date-fns/add_weeks'
import differenceInDays from 'date-fns/difference_in_days'

// var monthNames = [
//   "January", "February", "March",
//   "April", "May", "June", "July",
//   "August", "September", "October",
//   "November", "December"
// ];

const isRecurringEvent = (evt) =>(typeof evt.rrule !== 'undefined' && evt.rrule !== null) ||
        (typeof evt.rruleType !== 'undefined' && evt.rruleType !== null)
const isNotRecurringEvent = (evt) => !isRecurringEvent(evt)
const dateBetween = (start, end, chkDate) => compareDesc(start, chkDate) >=0 && compareAsc(end, chkDate) >=0
let mergeArrays = (arrays) => [].concat.apply([], arrays)

//-----------------------------------------------------------------------------
const nextMonthlyEventDate = (evt) =>  {
    // const dateDisp= (date) => monthNames[date.getMonth()]+ '-'+ date.getDate()+ '-'+ date.getUTCFullYear()+ '-dow:' + date.getDay()
    const dte = new Date(evt.startDate)
    // console.log('nextMonthlyEventDate:', dateDisp(dte), evt.rruleData);
    const iter=parseInt(evt.rruleData,10)
    let nextMonth = addWeeks(dte, 4)
    if (nextMonth.getUTCMonth() === dte.getUTCMonth()) {
        nextMonth = addWeeks(nextMonth, 1)
    }
    var quotient = Math.floor(nextMonth.getDate()/ 7);
    var remainder = nextMonth.getDate() % 7;
    // let weekNum = quotient //+ (remainder >= nextMonth.getDay() ? 1: 0)
    let minD = 7*(iter-1)
    // console.log('chk',dateDisp(nextMonth), 'i:'+ iter, 'w:'+weekNum, 'q:'+quotient, 'r:'+remainder, 'minD:', minD );
    // if (quotient < 2 || (quotient === 2 && remainder === 0) ) {
    if ( quotient !== iter && (nextMonth.getDate() <  minD || (quotient < 3 && remainder === 0))) {
        nextMonth = addWeeks(nextMonth, 1)
        quotient = Math.floor(nextMonth.getDate()/ 7);
        remainder = nextMonth.getDate() % 7;
        // console.log('Add week.', nextMonth.getDate(), quotient, remainder );
    }
    return nextMonth
}

//-----------------------------------------------------------------------------
const expandRecurranceEvent = (evt, start, end, acc) => {
    if (compareDesc(end, evt.startDate) >= 0 ) {
        return acc
    }
    if ( dateBetween(start, end, evt.startDate)) {
        // acc.push(evt)
        acc.push(Object.assign({}, evt, {startDate:new Date(evt.startDate)}))

    }
    switch (evt.freq) {
        case 'WEEKLY':
            // console.log('Expand WEEKLY event:', evt);
            const newWeeklyEvent = Object.assign({}, evt, {startDate:addWeeks(evt.startDate, 1)})
            return expandRecurranceEvent(newWeeklyEvent, start, end, acc)
        case 'MONTHLY':
            // if (evt.googleId === 'mumdp2ovj9dnlr75nqkr3o22n8@google.com') {
            //     // console.log('********' + require('util').inspect(evt.properties, { depth: 3 }));
            //     console.log('********', evt);
            // }

            // console.log('Expand MONTHLY event:', evt);
            const nextByDay = nextMonthlyEventDate(evt)
            const newMonthlyEvent = Object.assign({}, evt, {startDate:new Date(nextByDay)})
            return expandRecurranceEvent(newMonthlyEvent, start, end, acc)
        default:
            console.log('**** UNK frequency to expand event:', evt);
    }
}
//===========================================
function getCalendarDataForMonth(icalData, currDate) {
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
        console.log("Init icalData:", icalData)
        const dateInRange = (chkDate) => dateBetween(startDate, endDate, chkDate)
        const eventInRange = (evt) => dateInRange(evt.startDate) || dateInRange(evt.endDate)
        const expandEvent = (evt) => expandRecurranceEvent(evt, startDate, addDays(endDate, -1), [])

        console.log("Expanded Evts:", icalData.filter(isRecurringEvent).map(expandEvent))
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
    console.log('calendarData:', calendarData);
    return calendarData
}
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
const mapStateToProps = (state, ownProps) => {
    let recordState = state.CalendarData;

    let calendarData = recordState.CalendarData || [];
    let startDate  = new Date();
    calendarData = getCalendarDataForMonth(recordState.CalendarData, startDate)
    if (calendarData.length === 0 ) {
        calendarData = getCalendarDataForMonth(recordState.CalendarData, addWeeks(startDate,1))
    }


    return {
        calendarData: calendarData,
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

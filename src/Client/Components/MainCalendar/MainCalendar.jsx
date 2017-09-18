import React from 'react';
import  './MainCalendar.css'

import  startOfMonth from 'date-fns/start_of_month'
import  startOfWeek from 'date-fns/start_of_week'
import  endOfMonth from 'date-fns/end_of_month'
import  endOfWeek from 'date-fns/end_of_week'
import addMonths from 'date-fns/add_months'
import addDays from 'date-fns/add_days'
import getISOWeek from 'date-fns/get_iso_week'
import isSameDay from 'date-fns/is_same_day'
import isThisMonth from 'date-fns/is_this_month'
// import getMonth from 'date-fns/get_month'

import { Col, Row } from 'reactstrap';
import SmartLink from '../SmartLink'

var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

function outputCalDate(date, events, pivotDate) {
    let chkDate = date
    // console.log('chkDate:', chkDate);

    let matchDates = events.filter(evt => isSameDay(new Date(evt.startDate), chkDate ))

    // If date has an event set className to eventDay
    let className= matchDates.length > 0? 'eventDay':'calDay'
    if (date.getMonth() !== pivotDate.getMonth()) {
        // console.log('outsideMonth' , pivotDate.getMonth());
        className += ' outsideMonth'
    }
    return (
        <span key={date.getMonth() + '-' + date.getDate()} className={className}>{date.getDate()}</span>
    )
}

function week(dates, events, pivotDate) {
    return (
    <div  key={getISOWeek(addDays(dates[0], 1))} >
        {dates.map(date =>
            outputCalDate(date, events, pivotDate)
        )}
        <br/>
    </div>
    )
}

function currentMonthBlock(events) {
    let currDate  = new Date();
    let matchDates = events.filter(evt => isThisMonth(new Date(evt.startDate) ))
    // console.log('matchDates:', currDate, matchDates);
    if (matchDates.length === 0) {
        // console.log('No events remaining this month. Use Next Month.');
        currDate  = addMonths(currDate, 1)
    }

    const startDate = startOfWeek(startOfMonth(currDate) );
    const endDate = endOfWeek(endOfMonth(currDate) );

    let date = startDate;
    // let days = []
    let weeks = {}
    while (date < endDate) {
        let weekOfMonth = getISOWeek(addDays(date, 1)) // We want Sunday as start of week
        if (! Array.isArray(weeks[weekOfMonth])) {
            weeks[weekOfMonth]=[]
        }
        weeks[weekOfMonth].push(date)
        // days.push(date)
        date = addDays(date, 1)
    }

    return (
        <div id='currentMonthBlock'>
            <div className='MonthTitle'>{monthNames[currDate.getMonth()]}</div>
            {Object.keys(weeks).map(weekNum =>
                    week(weeks[weekNum], events, currDate )
            )}
            <br/>
        </div>
    )
/*
{'weeks ' + JSON.stringify(weeks)}  <br/>
{'events ' + JSON.stringify(events)}  <br/>

*/

}

function eventList(rawCalData) {
    // console.log("MainCalendar:calendarData:" , rawCalData);
    let calendarData = rawCalData.map( entry => {
        let date =  new Date(entry.startDate)
        const ts=date.getHours()+date.getMinutes()+date.getSeconds()
        // console.log('date:', date, ts);
        let time = '';
        if (ts > 0) {
            time += date.getHours() > 12 ? date.getHours()-12: date.getHours();
            time += ":"
            time += date.getMinutes() < 10 ? "0" + date.getMinutes(): date.getMinutes() ;
            time += date.getHours() > 12 ? ' PM': ' AM';
        }
        // console.log('TS', date.getTimezoneOffset());
        return {
            date: monthNames[date.getMonth()] + ' ' + date.getDate()+ (ts>0?' - ' + time:''),
            id:entry.id,
            description:entry.summary
        }
    })
    return (
<div id="eventList">{calendarData.map( (entry) =>
        <div className="entry" key={entry.id} >
            <div className="date">{entry.date}</div>
            <div className="description">{entry.description}</div>
        </div>
    )}
    <SmartLink link="/calendar" id="0" linkText=" ... More" />

    </div>    )
}

export default class MainCalendar extends React.Component {
    componentWillMount() {
        this.props.fetchData(this.props);
    }

    render() {
    if ( this.props.loading) {         return (<div>Loading</div>)     }
    if (this.props.calendarData.length === 0) {        return(null);    }
    // console.log("MainCalendar:calendarData:" , this.props.calendarData);
    // let calendarData = this.props.calendarData.map( entry => {
    //     let date =  new Date(entry.startDate)
    //     let time = date.getHours() > 12 ? date.getHours()-12: date.getHours();
    //     time += ":"
    //     time += date.getMinutes() < 10 ? "0" + date.getMinutes(): date.getMinutes();
    //     time += date.getHours() > 12 ? ' PM': ' AM';
    //     // console.log('TS', date.getTimezoneOffset());
    //     return {
    //         date: monthNames[date.getMonth()] + ' ' + date.getDate()+ ' - ' + time,
    //         id:entry.id,
    //         description:entry.summary
    //     }
    // })

    // <div className="title">Upcoming Events</div>
    // {JSON.stringify(entry)}
        return (
            <section id='MainCalendar' className="MainCalendar">
                <a id="MainCalendar-bookmark">MainCalendar Start</a>
                <h2>Upcoming Events</h2>
                    <Row>
                        <Col  md='5'  xs={{size:12}} id='calBlock'>
                        {currentMonthBlock(this.props.calendarData)}
                        </Col>
                        <Col  md='7'  xs={{size:12}} id='listBlock'>
                        {eventList(this.props.calendarData)}
                    </Col>
                    </Row>
        </section>
        );
    }
}

// {calendarData.map( (entry) =>
//     <div className="entry" key={entry.id} >
//         <div className="date">{entry.date}</div>
//         <div className="description">{entry.description}</div>
//     </div>
// )}

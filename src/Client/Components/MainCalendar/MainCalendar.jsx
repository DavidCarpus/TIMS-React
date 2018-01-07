import React from 'react';
import  './MainCalendar.css'
import {Link} from 'react-router-dom';
import addDays from 'date-fns/add_days'
import isWithinRange from 'date-fns/is_within_range'

import { Col, Row } from 'reactstrap';
// import SmartLink from '../SmartLink'
var Config = require('../../config'),
configuration = new Config();


const AgendaLink = (agendaID) =>
<Link  className='agendaIcon'
    to={configuration.ui.ROOT_URL + 'fetchfile/' + agendaID.agendaID}
    onClick={(event) => {
        event.preventDefault(); window.open(configuration.ui.ROOT_URL + 'fetchfile/' + agendaID.agendaID);
    }}>
    <img  src='/images/icons/Agenda.png' className='agendaIcon'   alt="Agenda" title="Agenda" />
</Link >

function currentMonthBlock(calDataByWeek, monthName) {
    const calDateStyle = (dayData) => (dayData.events.length > 0? 'eventDay':'calDay') +
        (getSundayOfWeekNumber(1).getMonth() !== dayData.date.getMonth() ?   ' outsideMonth' : '')
    const getSundayOfWeekNumber = (week) => calDataByWeek[Object.keys(calDataByWeek)[week]][0].date

    return (
        <div id='currentMonthBlock'>
            <div className='MonthTitle'>{monthName}</div>
            {calDataByWeek.map( (outputWeek, weekNum) =>
                <div key={'week'+weekNum}>
                    {outputWeek.map(day =>
                        <span key={(day.date.getMonth()+1) + '-' + day.date.getDate()}
                            className={calDateStyle(day)}>{day.date.getDate()}</span>
                    )}
                </div>
            )}

            <br/>
        </div>
    )
}

function eventList(evntLst, listID, filterFunc) {
    return (
    <ul  id={listID} className="eventList">
    {evntLst.filter(filterFunc).map( (entry) =>
        <li className="entry" key={entry.id} >
            <span className="date">{entry.dateStr} {
                    entry.agendaID && <AgendaLink agendaID={entry.agendaID}></AgendaLink>
            } - </span>
            <span className="date">{entry.timestamp}</span>
            <div className="description">{entry.description}</div>
        </li>
    )}
    </ul>
    )
}
// <SmartLink link="/calendar" id="0" linkText=" ... More" />

export default class MainCalendar extends React.Component {
    componentWillMount() {
        this.props.fetchData(this.props);
    }

    render() {
    if ( this.props.loading) {         return (<div>Loading</div>)     }
    if (Object.keys(this.props.calDataByWeek).length   === 0 ) { return(null);  }
    if (Object.keys(this.props.eventList).length   === 0 ) { return(null);  }

    const day = 9
    const minDate = addDays(new Date(),-2)
    const maxDate = addDays(new Date(),day)
    const closeDates = (entry)=>isWithinRange(entry.sdate, minDate, maxDate)
    const futureEvent = (entry)=> (entry.sdate - maxDate) > 0

        return (
            <section id='MainCalendar' className="MainCalendar">
                <a id="MainCalendar-bookmark">MainCalendar Start</a>
                <h2>Upcoming Events</h2>
                <Row>
                    <Col  md='4'  xs={{size:12}} id='calBlock'>
                        {currentMonthBlock(this.props.calDataByWeek, this.props.monthName)}
                    </Col>
                    <Col  md='8'  xs={{size:12}} id='listBlock'>
                        <h3>Next {day} days.</h3>
                        {eventList(this.props.eventList, "soonEventList", closeDates)}
                    </Col>
                </Row>
                <hr/>
                <Row>
                    <Col  md='12'  xs={{size:12}} id='listBlock'>
                        <h3>Later</h3>
                        {eventList(this.props.eventList, "futureEventList", futureEvent)}
                    </Col>
                </Row>
        </section>
        );
    }
}
/*

{currentMonthBlock(this.props.calDataByWeek, this.props.monthName)}
{eventList(this.props.eventList)}

*/

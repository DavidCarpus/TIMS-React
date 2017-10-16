import React from 'react';
import  './MainCalendar.css'
import {Link} from 'react-router-dom';


import { Col, Row } from 'reactstrap';
import SmartLink from '../SmartLink'
var Config = require('../../config'),
configuration = new Config();

var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];


function currentMonthBlock(calDataByWeek) {
    const calDateStyle = (dayData) => (dayData.events.length > 0? 'eventDay':'calDay') +
        (getSundayOfWeekNumber(1).getMonth() !== dayData.date.getMonth() ?   ' outsideMonth' : '')
    const getSundayOfWeekNumber = (week) => calDataByWeek[Object.keys(calDataByWeek)[week]][0].date
    const getMonthName= () => monthNames[getSundayOfWeekNumber(1).getMonth()]

    return (
        <div id='currentMonthBlock'>
            <div className='MonthTitle'>{getMonthName()}</div>
            {calDataByWeek.map( (outputWeek, weekNum) =>
                <div key={'week'+weekNum}>
                {outputWeek.map(day =>
                    <span key={(day.date.getMonth()+1) + '-' + day.date.getDate()} className={calDateStyle(day)}>{day.date.getDate()}</span>
                )}
                </div>
            )}
            <br/>
        </div>
    )
}


const AgendaLink = (agendaID) =>
        <Link  className='agendaIcon'
            to={configuration.ui.ROOT_URL + 'fetchfile/' + agendaID.agendaID}
            onClick={(event) => {
                event.preventDefault(); window.open(configuration.ui.ROOT_URL + 'fetchfile/' + agendaID.agendaID);
            }}>
        <img  src='/images/icons/Agenda.png' className='agendaIcon'   alt="Agenda" title="Agenda" />
        </Link >

function eventList(evntLst) {
    return (
<div id="eventList">{evntLst.map( (entry) =>
        <div className="entry" key={entry.id} >
            <div className="date">{entry.dateStr} {entry.agendaID && <AgendaLink agendaID={entry.agendaID}></AgendaLink>}</div>
                <div className="date">{entry.timestamp}</div>
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
    if (Object.keys(this.props.calDataByWeek).length   === 0 ) { return(null);  }
    if (Object.keys(this.props.eventList).length   === 0 ) { return(null);  }

        return (
            <section id='MainCalendar' className="MainCalendar">
                <a id="MainCalendar-bookmark">MainCalendar Start</a>
                <h2>Upcoming Events</h2>
                    <Row>
                        <Col  md='5'  xs={{size:12}} id='calBlock'>
                            {currentMonthBlock(this.props.calDataByWeek)}
                        </Col>
                        <Col  md='7'  xs={{size:12}} id='listBlock'>
                            {eventList(this.props.eventList)}
                    </Col>
                    </Row>
        </section>
        );
    }
}

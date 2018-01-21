import React from 'react';
import  './MainCalendar.css'
import {Link} from 'react-router-dom';
// import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'

import { Col, Row } from 'reactstrap';
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

function currentMonthBlock(calDataByWeek, monthName, prevMonth, nextMonth) {
    if(calDataByWeek.length <= 0) return null
    const calDateStyle = (dayData) => (dayData.events.length > 0? 'eventDay':'calDay') +
        (getSundayOfWeekNumber(1).getMonth() !== dayData.date.getMonth() ?   ' outsideMonth' : '')
    const getSundayOfWeekNumber = (week) => calDataByWeek[Object.keys(calDataByWeek)[week]][0].date
    const year = (new Date(calDataByWeek[2][0].date)).getUTCFullYear();
    return (
        <div id='currentMonthBlock'>
            <div className='MonthTitle'>
                <span  className='prevMonth' onClick={()=> prevMonth()}> <a >{"<"}</a> </span>
                <span className="title">{monthName + ' (' + year+')'}</span>
                <span className='nextMonth' onClick={()=> nextMonth()}> <a >{">"}</a> </span>
            </div>
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

function eventListBlock(evntLst, listID) {
    return (
    <ul  id={listID} className="eventList">
    {evntLst.map( (entry) =>
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

function filterBlock(displayFilters, modifyFilter) {
return (Object.keys(displayFilters).sort().map(fieldName=>
    <span key={fieldName}>
        <Field name={fieldName}
            onChange={(event, newValue, previousValue) => modifyFilter(fieldName, event, newValue, previousValue)}
            component="input" type="checkbox" />
        <label htmlFor={fieldName}>{fieldName}</label>
        &nbsp;&nbsp;
    </span>
))}



class MainCalendar extends React.Component {
    componentWillMount() {
        const year=(new Date()).getUTCFullYear()
        const month = (new Date()).getUTCMonth()
        this.props.fetchData(year, month );
        this.setState({
            year: year,
            month:month
        });
    }

    render() {
        const {
            loading, modifyFilter, eventList,
            getEventList, getCalByWeek, getMonthFromNum,
            displayFilters,
        } = this.props;

        if ( loading) {         return (<div>Loading</div>)     }
        if (eventList.length   === 0 ) { return(null);  }

        const newFilter = Object.assign({},displayFilters)
        const filteredEventList = getEventList(eventList, newFilter)
        const calDataByWeek = getCalByWeek(eventList,newFilter)

        const prevMonth = () => {
            this.props.fetchData(this.state.year, this.state.month-1)
            this.setState({ month:this.state.month-1 });
        }
        const nextMonth = () => {
            this.props.fetchData(this.state.year, this.state.month+1)
            this.setState({ month:this.state.month+1 });
        }

        return (
            <section id='MainCalendar' className="MainCalendar">
                <a id="MainCalendar-bookmark">MainCalendar Start</a>
                <h2>Upcoming Events</h2>
                    {filterBlock(displayFilters, modifyFilter)}
                <Row>
                    <Col  md='4'  xs={{size:12}} id='calBlock'>
                        {currentMonthBlock(calDataByWeek, getMonthFromNum(this.state.month), prevMonth, nextMonth)}
                    </Col>
                    <Col  md='8'  xs={{size:12}} id='listBlock'>
                        {eventListBlock(filteredEventList, "eventList")}
                    </Col>
                </Row>
        </section>
        );
    }
}
//==================================================
MainCalendar = reduxForm({
  form: 'CalendarFilterForm'  // a unique identifier for this form
})(MainCalendar)
//==================================================

export default MainCalendar

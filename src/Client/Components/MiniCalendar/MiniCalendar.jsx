import React from 'react';
import  './MiniCalendar.css'
// import SmartLink from '../SmartLink'
var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

export default class MiniCalendar extends React.Component {
    componentWillMount() {
        this.props.fetchData(this.props);
    }

    render() {
    if ( this.props.loading) {         return (<div>Loading</div>)     }
    if (this.props.calendarData.length === 0) {        return(null);    }
    // console.log("MiniCalendar:calendarData:" , this.props.calendarData);
    let calendarData = this.props.calendarData.map( entry => {
        let date =  new Date(entry.startDate)
        let time = date.getHours() > 12 ? date.getHours()-12: date.getHours();
        time += ":"
        time += date.getMinutes() < 10 ? "0" + date.getMinutes(): date.getMinutes();
        time += date.getHours() > 12 ? ' PM': ' AM';
        // console.log('TS', date.getTimezoneOffset());
        return {
            date: monthNames[date.getMonth()] + ' ' + date.getDate()+ ' - ' + time,
            id:entry.id,
            description:entry.summary
        }
    })

    // {JSON.stringify(entry)}
        return (
            <aside id='MiniCalendar' className="MiniCalendar">
                <div className="title">Upcoming Events</div>
                {calendarData.map( (entry) =>
                        <div className="entry" key={entry.id} >
                            <div className="date">{entry.date}</div>
                            <div className="description">{entry.description}</div>
                        </div>
                    )}

            </aside>
        );
    }
}

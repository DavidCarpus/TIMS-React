import React from 'react';
import SmartLink from '../SmartLink'
import  './AgendasAndMinutes.css'

function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  // var year = date.getFullYear();

  return monthNames[monthIndex] + ' ' + day ;
}

const MeetingBlock = ({meetingElements, meetingDate}) => {
    return (
        <div className="meetingBlock" >

            <div className="date" >
                {formatDate(meetingDate)}
            </div>
            <div className="Entries" >
            {meetingElements.map( element =>
                <div  className="meetingElement" key={element.id}>
                    <SmartLink link={element.link} id={element.id} linkText={element.description ? element.type + '-' + element.description: element.type } />
                </div>
            )}
            </div>
        </div >
    )
}

const YearBlock = ({yearRecords, year, expanded, toggleCollapseState}) => {
    return (
        <div  className='YearBlock'>
            <div className='header' >
                <span onClick={()=> toggleCollapseState(year)}>
                    <a >{year} {expanded?'...':'...'}</a>
                </span>
            </div>
            {expanded && yearRecords.map( meeting =>
                <MeetingBlock key={meeting[0]} meetingElements={meeting[1]} meetingDate={new Date(meeting[0])}   / >
            )}
        </div>
    )
}

// const AgendasAndMinutes = ({meetings, loading, id, title}) => {
export class AgendasAndMinutes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {expandedYears: []};
    // this.state.expandedYears.push((new Date()).getFullYear().toString())
    this.toggleYear = this.toggleYear.bind(this);

  }

  toggleYear(yearToToggle){
      let expandedYears = this.state.expandedYears;
      let yearIndex = expandedYears.indexOf(yearToToggle);
      if ( yearIndex >= 0)  {
          expandedYears.splice(yearIndex, 1);
      } else {
          expandedYears.push(yearToToggle)
      }
      this.setState({expandedYears:expandedYears})
  }

  render() {
     if ( this.props.loading) {         return (<div>Loading</div>)     }
     if (this.props.meetings.length === 0) {        return(null);    }
     if (Object.keys(this.props.meetings).length === 0) { return null }

     var currentMeetings = Object.keys(this.props.meetings)
         .map( _date  => {
             return {date:_date, values:  this.props.meetings[_date]}
         })
// console.log('currentMeetings:',currentMeetings);
     return (
         <div id='AgendasAndMinutes'>
             <a id="AgendasAndMinutes-bookmark">AgendasAndMinutes Start</a>

              <h2>{this.props.title}</h2>
              {currentMeetings
                  .sort((a,b) => { return b.date -a.date; })
                  .map( year => {
                    return (
                        <YearBlock key={year.date} yearRecords={year.values} year={year.date}
                            expanded={( this.state.expandedYears.indexOf(year.date) >= 0)}
                            toggleCollapseState={this.toggleYear}></YearBlock>
                    )
                  })}
         </div>
     )
 }
 }

 export default AgendasAndMinutes;

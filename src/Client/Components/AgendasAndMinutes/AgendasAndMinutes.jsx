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
  // var year = date.getFullYear();
  return monthNames[date.getMonth()] + ' ' + date.getDate() ;
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

export class AgendasAndMinutes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {expandedYears: []};
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
      const {
          loading, title, meetings
      } = this.props;

     if ( loading) {         return (<div>Loading</div>)     }
     if (meetings.length === 0) {        return(null);    }
     if (Object.keys(meetings).length === 0) { return null }

     return (
         <div id='AgendasAndMinutes'>
             <a id="AgendasAndMinutes-bookmark">AgendasAndMinutes Start</a>

              <h2>{title}</h2>
              {meetings
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

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


const YearBlock = ({yearMeetings, year, expanded}) => {
    // <div className={"expanded"}  >
    // <span>
    return (
        <span className={expanded? "showMeetings": "hideMeetings"} >
        {yearMeetings.map( (meeting, meetingIndex) => {
            return (
                <div key={meetingIndex}>
                    <span>{formatDate(new Date(meeting[0]))}</span>
                    {meeting[1].map( (element, elementIndex) => {
                    return (
                        <span  key={elementIndex}><SmartLink link={element.link} id={element.id} linkText={element.type} /></span>
                    )
                })}
                </div>
            )
        })}
        </span>
    )
}

// const AgendasAndMinutes = ({meetings, loading, id, title}) => {
export class AgendasAndMinutes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {expandedYears: [(new Date()).getFullYear().toString()]};
    this.toggle = this.toggle.bind(this);
  }

  toggle(yearToToggle){
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
              <h2>{this.props.title}</h2>
              {currentMeetings
                  .sort((a,b) => { return b.date -a.date; })
                  .map( (year, index1) => {
                    //   if ( this.state.expandedYears.length === 0) {this.toggle(year.date)}
                      let expandYear = false;

                    //   if (year.date === '2017') {expandYear = true;}
                      if ( this.state.expandedYears.indexOf(year.date) >= 0) {expandYear = true;}
                    return (
                        <div   key={index1} >
                        <a onClick={()=> this.toggle(year.date)}>
                            {year.date} {expandYear?'^':'v'}</a>

                        <YearBlock yearMeetings={year.values} year={year.date}
                            expanded={expandYear}></YearBlock>
                        </div>
                    )
                  })}
         </div>
     )
 }
 }

 export default AgendasAndMinutes;

/*
<li className={s.li}  key={index}>
    {meeting.date} -
    {meeting.values.map((element, index) => {
        const text = element.desc || element.type;
        return(<span  key={index}> <SmartLink link={element.link} id={element.id} linkText={text} />  </span>)
    })}
</li>
*/

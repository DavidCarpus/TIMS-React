import React from 'react';
import SmartLink from '../../Components/SmartLink'
import {  Col, Row } from 'reactstrap';
import  './PublicRecords.css'

  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

const publicRecordTypes = [
     'RFP',
     'NOTICE',
     'AGENDA',
     'RFPS',
     'NOTICES',
     'AGENDAS',
     'VOTING',
]

function formatDate(date) {

  var day = date.getDate();
  var monthIndex = date.getMonth();
  // var year = date.getFullYear();

  return monthNames[monthIndex] + ' ' + day ;
}

//-----------------------------------------------------------------------------
const MonthBlock = ({monthRecords, month, year}) => {
    return (
        <div className='MonthBlock' >
            <div className='header' >
                {monthNames[monthRecords.month]}  - {year}<br/>
            </div>
        {monthRecords.values.map( (day) =>{
            let recordDate = formatDate(new Date(day[0]))
            return (
                <div key={recordDate} >
                    <div className='date' >
                        {recordDate}
                    </div>
                    <div className='Entries' >
                    {day[1].map(entry =>{
                        let label = entry.recorddesc;
                        if (label === null) { label =  entry.groupDescription; }
                        if (label === null) { label =  entry.groupName === 'UNK' ? "Main" : ''; }
                        return (
                            entry.link &&
                            <div key={entry.id}  className='documentLink'>
                                <SmartLink link={entry.link} id={entry.id} linkText={label } />
                            </div>

                        )
                    })}
                </div>
                </div>
            )
        })}
        <br/>
    </div>
    )
}

//-----------------------------------------------------------------------------
const YearBlock = ({yearRecords, year, expanded, toggleCollapseState}) => {
    let recordsByMonth = yearRecords.reduce( (acc, curr, i) => {
                let month = (new Date(curr[0])).getMonth();
                acc[month] = acc[month]? acc[month]: [];
                acc[month].push(curr)
                return acc;
            }, {})

    var groupedByMonth = Object.keys(recordsByMonth)
        .map( _month  => {
            return {month:_month, values:  recordsByMonth[_month]}
        }).sort((a,b) => {
                return b.month - a.month
        })

    return (
        <div  className='YearBlock'>
            <span onClick={()=> toggleCollapseState(year)}
                >
                <div className='header' >
                    <a >
                        {year} {'...'}
                    </a>
                </div>

            </span>
            {expanded && groupedByMonth.map(element =>
                    <MonthBlock key={element.month} month={element.month} monthRecords={element} year={year}></MonthBlock>
                )}
        </div>
    )
}
// {year} {expanded?'^^^':'vvv'}


//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
export default class PublicRecordsUI extends React.Component {
    constructor(props){
        super(props);
        this.toggleYear = this.toggleYear.bind(this);
        this.state = {expandedYears: []};
        // this.state.expandedYears.push((new Date()).getFullYear().toString())
}

    componentWillMount() {
        this.props.fetchData(this.props.recordType);
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
      var tmpStyle = {backgroundColor: 'white'}

      if ( this.props.loading) {         return (<div style={tmpStyle}>Loading</div>)     }
    //   if (this.props.records.length === 0) {        return(null);    }
    //   if (Object.keys(this.props.records).length === 0) { return null }

      var currentRecords = Object.keys(this.props.records)
          .map( _date  => {
              return {date:_date, values:  this.props.records[_date]}
          })
          .sort((a,b) => { return b.date -a.date; })

          if (publicRecordTypes.indexOf(this.props.recordType.toUpperCase()) !== -1 ) {
              return (
                  <Row id='PublicRecords'>
                      <Col  md={{size:10, push:1}} id='contentArea'>
                          <h1>{this.props.recordType}</h1>
                          {currentRecords
                              .map( year => {
                                  return (
                                      <YearBlock key={year.date} yearRecords={year.values} year={year.date}
                                          expanded={( this.state.expandedYears.indexOf(year.date) >= 0)}
                                          toggleCollapseState={this.toggleYear}></YearBlock>
                                  )
                              })}
                    </Col>
                    </Row>
                    )
          } else {
              return (
                  <Col md={10}  mdPush={1}  id="contentArea"  >
                      <div  id='PublicRecords'>Unknown PublicRecords Type: {this.props.recordType}</div>
                  </Col>
              )
          }
  }
}

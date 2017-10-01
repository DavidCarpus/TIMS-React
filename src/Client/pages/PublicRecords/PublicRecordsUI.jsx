import React from 'react';
import SmartLink from '../../Components/SmartLink'
import {  Col, Row } from 'reactstrap';
import  './PublicRecords.css'
import FilterRecordsForm from './Filter/Filter'

const publicRecordTypes = [
    'RFP',
    'NOTICE',
    'AGENDA',
    'DOCUMENTS',
    'RFPS',
    'NOTICES',
    'MINUTES',
    'AGENDAS',
    'VOTING',
]

const dateStr =(date)=> date && (date.getUTCMonth()+1) + '/' + date.getUTCDate()+ '/' + date.getUTCFullYear()

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
        if (publicRecordTypes.indexOf(this.props.recordType.toUpperCase()) === -1 ) {
            return (
                <Col md={10}  mdPush={1}  id="contentArea"  >
                    <div  id='PublicRecords'>Unknown PublicRecords Type: {this.props.recordType}</div>
                </Col>
            )
        }
        var currentRecords = this.props.records
        return (
            <Row id='PublicRecords'>
                <Col  md={{size:10, push:1}} id='contentArea'>
                    <h1>{this.props.recordType}</h1>
                    <FilterRecordsForm
                        records={currentRecords}
                        groupSelection={this.props.groupSelection}
                        initialValues={this.props.currentFilter}
                        currentFilter={this.props.currentFilter}
                        updateFilter={this.props.updateFilter}>
                    </FilterRecordsForm>
                    {currentRecords.map(record =>
                        <div key={record.id}  className='documentLink'>
                            <SmartLink link={record.link} id={record.id} linkText={record.recorddesc || record.groupDescription } />
                            <span className="posted">
                                (Posted {dateStr(new Date(record.date))})
                                {record.groupName === 'UNK' ? "" : " - " +record.groupName}
                            </span>
                            <br/>
                        </div>
                    )}
                </Col>
            </Row>
        )
    }
}

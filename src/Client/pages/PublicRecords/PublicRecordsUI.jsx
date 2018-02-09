import React from 'react';
import SmartLink from '../../Components/SmartLink'
import {  Col, Row } from 'reactstrap';
import  './PublicRecords.css'
import FilterRecordsForm from './Filter/Filter'

const dateStr =(date)=> date && (date.getUTCMonth()+1) + '/' + date.getUTCDate()+ '/' + date.getUTCFullYear()

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
export default class PublicRecordsUI extends React.Component {
    componentWillMount() {
        this.props.fetchData(this.props.currentFilter);
    }

    render() {
        const {
            loading, currentFilter, records,changeFilter, filterFields, meta
        } = this.props;
        if ( loading) {         return (<div style={{backgroundColor: 'white'}}>Loading</div>)     }

        // console.log('currentFilter', currentFilter);
        // console.log('meta', meta);
        // console.log('records', records);

        if(meta.dateRange){
            const startYear = (new Date(meta.dateRange[0])).getUTCFullYear();
            const endYear = (new Date(meta.dateRange[1])).getUTCFullYear();
            const years =Array.apply(null, Array(endYear - startYear+1)).map(function (x, y) { return endYear - y; });
            const yearFilter = {fieldName:"year", description:"Year",
                options: [{id:"", description:"Any"}].concat(
                    years.map(year=> ({id:year, description:""+year}))
                ),
            }
            let addYearFilter = false
            if(Object.keys(currentFilter).indexOf("year") >= 0)  addYearFilter = true
            if (meta.recordCount >= meta.limit) addYearFilter = true

            if(addYearFilter && filterFields.filter(field=>field.fieldName === 'year').length === 0) filterFields.push(yearFilter)
        }

        const initialValues = Object.keys(currentFilter).map(field =>
            ({[field]:filterFields.filter(filterField=>filterField.fieldName===field)[0]
                .options.filter(option=> (""+option.id) === currentFilter[field] )[0]
                .id
            })
        ).reduce( (acc, val) => Object.assign(acc, val),{})

        return (
            <Row id='PublicRecords'>
                <Col  md={{size:10, push:1}} id='contentArea'>
                    <h1>Public Records</h1>
                    <FilterRecordsForm
                        records={records}
                        initialValues={initialValues}
                        currentFilter={currentFilter}
                        changeFilter={changeFilter}
                        filterFields={filterFields}
                        />
                    {records.map(record =>
                        <div key={record.id}  className='documentLink'>
                            <SmartLink link={record.link} id={record.id}
                                linkText={record.recorddesc || record.groupDescription }
                                type={record.type}
                                 />
                                {!currentFilter.recordType && <span className="recordtype">{record.type}</span> }
                                {!currentFilter.pageLink && <span className="group"> {record.groupName} </span> }
                                <span className="posted"> (Posted {dateStr(new Date(record.date))}) </span>
                            <br/>
                        </div>
                    )}
                </Col>
            </Row>
        )
    }
}

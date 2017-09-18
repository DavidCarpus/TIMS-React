import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import Dropzone from 'react-dropzone';
// import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
// import DateInput from './DateInput';
// const  { DOM: { input, select, textarea } } = React

const updateTypes = [
    {description:'', values:[]},
    {description:'Add', values:['','Minutes', 'Agenda', 'Document', 'Notice']},
    // {description:'Update', values:['','Users', 'PageText']},
    {description:'Archive', values:['','Minutes', 'Agenda', 'Document', 'Notice']},
]


//==================================================
const renderDropzoneInput = (field) => {
    const files = field.input.value;
    return (
        <div >
            <Dropzone
                className='fileDropzone'
                name={field.name}
                onDrop={
                    ( filesToUpload, e ) => {
                        console.log(filesToUpload);
                        return field.input.onChange(filesToUpload)
                    }
                }
                >
                Drop file here, or click to select file to upload.
            </Dropzone>
            {field.meta.touched &&
                field.meta.error &&
                <span className="error">{field.meta.error}</span>}
                    {files && Array.isArray(files) && (
                        <ul>
                            { files.map((file, i) => <li key={i}>{file.name}</li>) }
                        </ul>
                    )}
                </div>
            );
        };

//https://ollie.relph.me/blog/redux-form-and-dropzone-react-example/
//==================================================
const DocDateField = ({fieldName, valid, label}) => {
    return (
        <span className='dateField'>
            <label htmlFor={fieldName} className={valid ? '': 'required'}>{label} </label>
            <Field name={fieldName} component="input" type="text"/>
    </span>
    )
}
//==================================================
const requiredFieldsEntered = (validData) => {
    let result=true
    Object.keys(validData).map(key => result = result && validData[key])
    return result;
}
//==================================================
const SelectionField = ({fieldName, labelText, items, onChange, cn}) =>
    items ?
    <span className="SelectionField">
        <label htmlFor={fieldName} className={cn}>{labelText}:</label>
        <Field name={fieldName} component="select" onChange={onChange}>
            {items.map( (option, index) =>
                <option value={option.id} key={option.id}>{option.description}</option>
            )}
        </Field>
    </span>
    : null

//==================================================
const ElementTypeField = ({updateType, onChange, cn}) => {
    if (updateType === null || typeof updateType === 'undefined') { return null}
    return (
        <span className="ElementTypeField">
        <label htmlFor='elementType' className={cn}>Record Type: </label>
        <Field name="elementType" component="select" onChange={onChange}>
            {updateTypes.filter(type => type.description === updateType )[0]
                .values.map( type =>
                <option value={type} key={type}>{type}</option>
            )}
        </Field>
        <br/>
    </span>
)}
//==================================================
class DocumentArchiveData extends Component {
    render() {
        const {
            group,recordType, archiveDateChange, archiveData
        } = this.props

        return (<div>
            <br/>
            Archive {recordType} for {group}
            <div>
            <label htmlFor='year' >Year: </label>
            <Field name="year" component="select" onChange={archiveDateChange}>
                {['',2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, ].map( year =>
                    <option value={year} key={year}>{year}</option>
                )}
            </Field>
            </div>
            <div>
                <label htmlFor='month' >Month: </label>
                <Field name="month" component="select" onChange={archiveDateChange}>
                    {['',1,2,3,4,5,6,7,8,9,10,11,12, ].map( month =>
                        <option value={month} key={month}>{month}</option>
                    )}
                </Field>
            </div>
            {archiveData.length > 0 &&
                <SelectionField
                    fieldName='archiveItem' items={archiveData} labelText='Item to (un*)Archive' >
                </SelectionField>
            }

        </div>)
        }

}

/*
{"group":"Selectmen","updateType":"Archive","elementType":"Minutes","year":"2010","month":"5"}
*/
// const DocumentArchiveData = ({recordType, group, validData}) =>
//     <span>Archive Data form for {group} {recordType}</span>

//==================================================
const DocumentUploadData = ({validData, recordType}) =>
    <span>
        <DocDateField
            valid={validData['documentDate']}
            fieldName="documentDate"
            label='Document Date:'
            />
        {process.env.NODE_ENV === 'development' &&
        <div className='expires'>
                <label htmlFor='expires' >Expiration Date or Days to expire </label>
                <Field name='expires' component="input" type="text"/>
        </div>
        }
        <div className="description">
            <label htmlFor='description' >Description of {recordType} </label>
            <Field name='description' component="input" type="text"
                placeholder='Defaults to filename'
                />
        </div>
        <div className="mainpage">
            <label htmlFor='mainpage' >Show on main page</label>
            <Field name="mainpage" id="mainpage" component="input" type="checkbox"/>
        </div>

        <Field
            name='file'
            component={renderDropzoneInput}
            />
    </span>


//==================================================
class SubmitChangeForm extends Component {
    handleDayClick = (day, { selected }) => {
        console.log('handleDayClick:day:', day);
        this.setState({
            selectedDay: selected ? undefined : day,
        });
    };

    fetchDocs(archiveData, fetchDocuments){
        if (archiveData.year && archiveData.month) {
            fetchDocuments(archiveData);
        }
    }

    render() {
        // let SubmitChangeForm = props => {
        const {
            handleSubmit,
            submitSucceeded,
            fetchDocuments,
            validData,
            groups,
            year, month,
            archiveData,
            err,
        } = this.props

        // console.log('SubmitChangeForm:prop:', this.props);
        const hasErrors = err && !err.success;

        if (submitSucceeded && !hasErrors ) {
            console.log('****** Reseting form ***');
            this.props.reset()
        }
        let archiveDate = {year:year , month: month,
            group:this.props.group,
            elementType:this.props.elementType
        }

        return (
            <div id='SubmitChangeForm'>
                <form onSubmit={values => handleSubmit(values)}>
                    <div>Submit Change Form</div>
                    <SelectionField
                        fieldName='group' items={groups} labelText='Group' cn={validData['group']? '': 'required'}
                        onChange={(evt, newValue, previousValue) => {
                                // console.log(evt.currentTarget.name,':onChange');
                                archiveDate[evt.currentTarget.name] = newValue
                                this.fetchDocs(archiveDate, fetchDocuments)
                        }}
                        >
                    </SelectionField>

                    { err && !err.success && err.errors && err.errors.group}
                    <br/>
                    <label htmlFor='updateType' className={validData['updateType'] ? '': 'required'}>Update Type: </label>
                    <Field name="updateType" component="select"
                        onChange={(evt, newValue, previousValue) => {
                                // console.log(evt.currentTarget.name,':onChange');
                                archiveDate[evt.currentTarget.name] = newValue
                                this.fetchDocs(archiveDate, fetchDocuments)
                        }}
                        >
                        {updateTypes.map( type =>
                            <option value={type.description} key={type.description}>{type.description}</option>
                        )}
                    </Field>
                    <br/>
                    <ElementTypeField
                        updateType={this.props.updateType}
                        cn={validData['elementType']? '': 'required'}
                        onChange={(evt, newValue, previousValue) => {
                                // console.log(evt.currentTarget.name,':onChange');
                                archiveDate[evt.currentTarget.name] = newValue
                                this.fetchDocs(archiveDate, fetchDocuments)
                            }}
                        ></ElementTypeField>

                    { this.props.elementType && this.props.updateType === 'Add' &&
                            <DocumentUploadData validData={validData} recordType={this.props.elementType}></DocumentUploadData>
                        }
                        { this.props.elementType && this.props.updateType === 'Archive' &&
                            <DocumentArchiveData
                                recordType={this.props.elementType}
                                group={this.props.group}
                                archiveData={archiveData}
                                archiveDateChange={(evt, newValue, previousValue) => {
                                    archiveDate[evt.currentTarget.name] = newValue
                                    this.fetchDocs(archiveDate, fetchDocuments)
                                }}
                                validData={validData}>
                            </DocumentArchiveData>
                        }


                    { hasErrors && err.errors &&
                        <div>{JSON.stringify(err.errors)}</div>
                    }
                    <div>
                        <button className='button' type="submit" disabled={!requiredFieldsEntered(validData)}>Submit</button>
                    </div>
                    {submitSucceeded && !hasErrors &&
                        <div>Submission successful.</div>
                    }
                </form>
            </div>
        )
    }
}

//==================================================
const selector = formValueSelector('SubmitChangeForm') // <-- same as form name
SubmitChangeForm = connect(
    state => {
        const group = selector(state, 'group')
        const updateType = selector(state, 'updateType')
        const elementType = selector(state, 'elementType')
        const documentDate = selector(state, 'documentDate')
        const year = selector(state, 'year')
        const month = selector(state, 'month')
        //   console.log('formValueSelector:updateType:', updateType);
        const validData = {group: (group && group.length > 1 ),
            updateType: (updateType && updateType.length > 1),
            elementType: (elementType && elementType.length > 1),
            documentDate: (documentDate && documentDate.length >= 8),
        }

        return {
            group,
            updateType,
            elementType,
            validData,
            documentDate,
            year, month,
        }
    }
)(SubmitChangeForm)

export default reduxForm({ form: 'SubmitChangeForm' })(SubmitChangeForm)

import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'

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

class FilterRecordsForm extends Component {
    render() {
         const {
             changeFilter, handleSubmit, currentFilter, filterFields,
         } = this.props

         return (
             <div id='PublicRecordFilter'>
                 <form onSubmit={values => handleSubmit(values)}>
                     {filterFields.map(field =>
                     <div key={field.fieldName} className={field.fieldName}>
                         <SelectionField
                             fieldName={field.fieldName}
                             items={field.options}
                             onChange={(evt, newValue, previousValue) => {
                                 changeFilter(evt, currentFilter, field.fieldName, previousValue, newValue)
                             }}
                             labelText={field.description} >
                         </SelectionField>
                         <br />
                     </div>

                 )}
                 </form>
             </div>
         )
    }
 }

 const selector = formValueSelector(' FilterRecordsForm') // <-- same as form name
 FilterRecordsForm = connect(
     state => {
         const groupName = selector(state, 'groupName')

         return {
             groupName,
         }
     }
 )(FilterRecordsForm)

export default reduxForm({ form: 'FilterRecordsForm' })(FilterRecordsForm)

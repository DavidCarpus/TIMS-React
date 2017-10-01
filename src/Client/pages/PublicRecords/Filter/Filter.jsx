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
             updateFilter,
             groupSelection,
             handleSubmit,
             currentFilter,
            //  err,
         } = this.props

        //  console.log("FilterRecordsForm props", this.props);


         return (
             <div id='PublicRecordFilter'>
                 <form onSubmit={values => handleSubmit(values)}>
                     Filter by - -
                     <SelectionField
                         fieldName='groupName'
                         items={groupSelection}
                         onChange={(evt, newValue, previousValue) => {
                             updateFilter(currentFilter, "groupName", newValue)
                         }}
                         labelText='Group' >
                     </SelectionField>
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

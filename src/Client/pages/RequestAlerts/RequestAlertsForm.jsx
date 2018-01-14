import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import { contactTypes, getContactType } from "./RequestAlerts"
import  "./RequestAlerts.css"

//==================================================
const SelectOption = (field) =>
    <option key={field.value} value={field.value}>{field.label}</option>

//==================================================
const SelectionList = ({pageLink, desc, recordTypes}) =>
    <tr>
        <td>{desc}</td>
        {recordTypes.map((recordType,index)=>
            <td className='alertOption' key={index}>
                 <Field name={"alertOption_"+pageLink+'_'+ recordType.type} id={pageLink+'_'+ recordType.type} component="input" type="checkbox"/>
            </td>
        )}
    </tr>

//==================================================
const NonGroupOptions = ({options}) =>
<table>
    <thead>
        <tr><th>Town</th><th></th></tr>
    </thead>
    <tbody>
        {options.map((recordType,index)=>
            <tr key={'nonGroupOption'+index}>
            <td>{recordType.label}</td>
            <td className='alertOption' key={'Home'+index}>
                 <Field name={"alertOption_Home_"+ recordType.type} id={'Home_'+ recordType.type} component="input" type="checkbox"/>
            </td>
            </tr>
        )}
    </tbody>
</table>

//==================================================
const GroupOptions = ({options}) =>
    <table>
        <thead>
            <tr>
                <th>Board / Committee</th>
                {(options.length>0?options[0].recordTypes.map(recordType=>recordType.label):[]).map(header=>
                    <th key={header}>{header}</th>
                )}
            </tr>
        </thead>

        <tbody>
        {options.map( (option, index) =>
            <SelectionList
                key={option.group.pageLink.replace('/', '')}
                desc={option.group.description}
                pageLink={option.group.pageLink.replace('/', '')}
                recordTypes={option.recordTypes} />
            )}
        </tbody>
    </table>
//==================================================
class RequestAlertsForm extends Component {
  render() {
      // alertOptions,
    const {
        handleSubmit, phoneCarriers, options, nonGroupOptions,
        contactType, validToSubmit, validContact,
        dbSubmit, dbSubmitComplete
    } = this.props;
    // console.log(this.props);

    return (
        <div id='RequestAlerts'>
            {! validToSubmit &&
                <div className='required'> Required Fields </div>
            }
      <form onSubmit={values => handleSubmit(values)}>
        <div>
            <label htmlFor='contact' className={validContact? '': 'required'}>Contact information: </label>
            <Field name="contact" component="input" type="text"
                placeholder='Cell phone or email address'
                />
        </div>
            {contactType === contactTypes.PHONE &&
                <div>
                    <label htmlFor='phoneCarrier' className={validToSubmit? '' : 'required'}>Carrier: </label>
                    <Field name="phoneCarrier"
                        component='select'>
                        {phoneCarriers
                        .map(SelectOption)}
                    </Field>
                </div>
            }

            <br/>
            <NonGroupOptions options={nonGroupOptions} />
            <br/>
            <GroupOptions options={options} />

            {validToSubmit &&
                <div>
                    <button className='button' type="submit" disabled={!validToSubmit || dbSubmit}>Submit</button>
                    {dbSubmitComplete &&
                        <div>Submission Successful</div>
                    }
                </div>
            }

      </form>
  </div>
    );
  }
}
//==================================================
RequestAlertsForm = reduxForm({
  form: 'RequestAlertsForm'  // a unique identifier for this form
})(RequestAlertsForm)
//==================================================
// Decorate with connect to read form values
const selector = formValueSelector('RequestAlertsForm') // <-- same as form name
RequestAlertsForm = connect(
  state => {
    const carrier = selector(state, 'phoneCarrier')
    const hasPhoneCarrierValue = typeof carrier !== 'undefined' && carrier !==  'UNK'
    const contactType = getContactType(selector(state, 'contact'))
    const validContact = (contactType === contactTypes.EMAIL || contactType === contactTypes.PHONE)
    const validToSubmit = (contactType === contactTypes.EMAIL || (contactType === contactTypes.PHONE && hasPhoneCarrierValue ))

    return {
      hasPhoneCarrierValue,
      contactType,
      validToSubmit,
      validContact
    }
  }
)(RequestAlertsForm)

export default RequestAlertsForm

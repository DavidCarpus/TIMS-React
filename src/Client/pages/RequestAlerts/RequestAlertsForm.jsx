import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import { contactTypes, getContactType } from "./RequestAlerts"
import  "./RequestAlerts.css"

//==================================================
const SelectOption = (field) =>
    <option key={field.value} value={field.value}>{field.label}</option>

        //==================================================
class RequestAlertsForm extends Component {
  render() {
    const {
        handleSubmit,
        alertOptions, phoneCarriers,
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
            {alertOptions.map( (option, index) =>
                <div key={index}>
                    <Field name={"alertOption_"+option.label} id={option.type} component="input" type="checkbox"/>
                    <span>{option.label}</span>
                </div>
            )}
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

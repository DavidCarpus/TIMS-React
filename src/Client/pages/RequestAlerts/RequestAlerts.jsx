import { connect } from 'react-redux'
import RequestAlertsUI from './RequestAlertsForm'
import {pushAlertRequests} from '../../actions/AlertRequests'
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var emailValidate = require("email-validator");

const phoneCarriers2 = [
    {value: "UNK",  label: ''},
    {value: "ATT",  label: 'ATT'},
    {value: "VERIZON",  label: 'Verizon'},
]

const alertOptions = [
    {label:'RFPs', type: 'RFP', enabled:1},
    {label:'Notices', type: 'Notice', enabled:0},
    {label:'Agendas', type: 'Agenda', enabled:0},
]
export const contactTypes = {
    PHONE : 'phone',
    EMAIL : 'email',
    UNK: 'unknown'
}


const mapStateToProps = (state, ownProps) => {
    let recordState = state.AlertRequests;
    let initialValues = {}

    // if (process.env.NODE_ENV === 'development') {
    //     initialValues = {
    //         phoneCarrier: 'ATT',
    //         contact: '6036523221',
    //         alertOption_Notices: true, alertOption_Agendas: true
    //     }
    // }
    return {
        alertOptions: alertOptions,
        phoneCarriers: phoneCarriers2,
        initialValues: initialValues,
        // submitting: recordState.submitting,
        dbSubmit: recordState.submitting,
        dbSubmitComplete: !recordState.submitting && recordState.data && recordState.data.alertUserID > 0,
    };
}

export function getContactType( textValue) {
    try {
        let phoneNumber= phoneUtil.parse(textValue, 'US');
        if (phoneUtil.isPossibleNumber(phoneNumber)) {
            return contactTypes.PHONE
        }
   } catch (e) {
    //    console.log("NumberParseException was thrown: " + e);
   }
   if(emailValidate.validate(textValue))   return contactTypes.EMAIL;
   return contactTypes.UNK;
}

const mapDispatchToProps = (dispatch) => {
  return {
      onSubmit: (values) => {
          var submitData = {...values}

          submitData.options = alertOptions.map(alertOption => {
              let option = {NoticeType:alertOption.type, enabled: values['alertOption_'+alertOption.label] || false}
              delete submitData['alertOption_'+alertOption.label]
              return option;
          })
          dispatch(pushAlertRequests(submitData));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RequestAlertsUI);

import { connect } from 'react-redux'
import RequestAlertsUI from './RequestAlertsForm'
import {pushAlertRequests} from '../../actions/AlertRequests'
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var emailValidate = require("email-validator");

const getPhoneCarriers = ()=>[
    {value: "UNK",  label: ''},
    {value: "ATT",  label: 'ATT'},
    {value: "VERIZON",  label: 'Verizon'},
]

const getAlertOptions = ()=> [
    // {label:'RFPs', type: 'RFP', enabled:1},
    {label:'News', type: 'News', enabled:0},
    {label:'Notices', type: 'Notice', enabled:0},
    {label:'Documents', type: 'Documents', enabled:0},
    {label:'Agendas', type: 'Agenda', enabled:0},
    {label:'Minutes', type: 'Minutes', enabled:0},
]

export const contactTypes = {
    PHONE : 'phone',
    EMAIL : 'email',
    UNK: 'unknown'
}
// const getContactTypes = ()=> contactTypes
const undef = (elem)=> typeof elem === 'undefined'
const getGroupNames = (state) => {
    if (undef(state)  || undef(state.MainMenus) || undef(state.MainMenus.menus)) return []
    if (undef(state.MainMenus.menus['/BoardsAndCommittees'])) return []

    return state.MainMenus.menus['/BoardsAndCommittees'].menus
    .map(menu=> ({pageLink:menu.pageLink, description:menu.description}))
}

const mapStateToProps = (state, ownProps) => {
    let recordState = state.AlertRequests;
    let initialValues = {}

    const options = getGroupNames(state)
        .map(group =>
            ({group:group, recordTypes:getAlertOptions()})
        )
    const nonGroupOptions = [
        {label:'RFPs', type: 'RFP'},
        {label:'Emergency Alerts', type: 'Alerts'},
        // {label:'Quote Request', type: 'Quote'},
    ]
    // console.log('options',options);
    if (process.env.NODE_ENV === 'development') {
        initialValues = {
            phoneCarrier: 'ATT',
            contact: '6036523221',
            // alertOption_Notices: true, alertOption_Agendas: true
        }
    }
    return {
        alertOptions: getAlertOptions(),
        options: options,
        nonGroupOptions: nonGroupOptions,
        phoneCarriers: getPhoneCarriers(),
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
          const options = Object.keys(submitData).filter(fieldName => fieldName.startsWith('alertOption'))
          .map(fieldName=> {
              const optionParts=fieldName.split('_')
              const optionValue=submitData[fieldName]
              delete submitData[fieldName]
              return {option:{pageLink:optionParts[1], recordType:optionParts[2]}, value:optionValue}
          })
          .filter(option=>option.value)
          submitData.options = options
          // console.log('submitData',submitData);
          dispatch(pushAlertRequests(submitData));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RequestAlertsUI);

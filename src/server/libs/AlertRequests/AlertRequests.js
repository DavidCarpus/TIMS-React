var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var emailValidate = require("email-validator");
var sendAutomationEmail = require('../emailProcessors/common').sendAutomationEmail;

let cellCarriers = require('./cellCarriers.json')

var knex = require('../db/common').getKnexConnection()

// Verizon
// We are currently investigating a technical issue that is preventing Verizon clients from signing up for text alerts.  If you use Verizon, please click here to give us your number.
//===========================================
const contactTypes = {
    PHONE : 'phone',
    EMAIL : 'email',
    UNK: 'unknown'
}
//===========================================
const alertRequestHeaders = {
    [contactTypes.EMAIL]:'Please reply to this email to confirm your request to be alerted when the below items are posted:\n\n',
    [contactTypes.PHONE]:'Please reply to this text message to confirm your request to be alerted when the below items are posted:\n\n',
}
//===========================================
function getContactType( textValue) {
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
//===========================================
function dbValidationSent(knexConnection, request) {
    return knexConnection("AlertRequest")
    .where({alertRequestId: request.alertRequestId })
    .update({dateValidationSent: new Date() })
    .then(function (response) {
        console.log( 'dateValidationSent', response );
        return Promise.resolve(request)
    })
}
//===========================================
const alertRequestOptionsToText = (options) => Object.keys(options).map(option =>  option + ' - '+ options[option]).join('\n')
//===========================================
const sendAlertRegistrationEmail = (destEmail, text, request) =>{
    return sendAutomationEmail(destEmail,  {
        subject: 'Requested alert registration. Request#'+request.alertRequestId,
        text: text + alertRequestOptionsToText(request.options),
    })
    .then(emailResult =>
        dbValidationSent(knex, request )
        .then(dbResult => {
            return Promise.resolve(Object.assign({},request, emailResult) )
        })
    )
}
//===========================================
const recordTypeByPageLink = (acc, val) =>{
    const page = val.pageLink === 'Home'? "Town":val.pageLink
    acc[page] = acc[page]? acc[page].concat(val.recordType):[val.recordType]
    return acc
}
//===========================================
function verifyPhoneAlertRequest(request) {
    return sendAlertRegistrationEmail(
        request.contact + '@' + cellCarriers.filter(carrier => carrier.Carrier == request.carrier )[0].email,
        alertRequestHeaders[contactTypes.PHONE],
        request)
}
//===========================================
function verifyEmailAlertRequest(request) {
    return sendAlertRegistrationEmail(request.contact, alertRequestHeaders[contactTypes.EMAIL] , request)
}
//===========================================
function verifyAlertRequests() {
    const onlyFirstRecordForAContact = (acc, val) =>
    (acc.filter(elem=> elem.contact === val.contact).length === 0)? acc.concat(val):  acc

    return knex("AlertRequest").select('alertRequestId','contact', 'contactType', 'carrier', 'dateRequested')
    .where('dateValidationSent', 0).orderBy('contact').orderBy('dateRequested', 'desc')
    .then(requestsToVerify =>
        Promise.all(requestsToVerify.reduce( onlyFirstRecordForAContact, []).map(request=>
            knex("AlertRequestData").select().where("alertRequestId", request.alertRequestId).orderBy('pageLink')
            .then(requestData => {
                return Promise.resolve( Object.assign({},request,
                    {options: requestData.reduce( recordTypeByPageLink , []) }))
            })
        ))
    )
    .then(requestsWithData =>
        Promise.all(requestsWithData.filter(record=>record.contactType === 'email').map(verifyEmailAlertRequest))
        .then(emailsProcessed =>
            Promise.all(requestsWithData.filter(record=>record.contactType === 'phone').map(verifyPhoneAlertRequest))
            .then(phonesProcessed => phonesProcessed.concat(emailsProcessed))
        )
    )
}
//===========================================
function submitAlertRequestData(submittedData) {
    let alertRequest = {
        dateRequested: new Date(),
        dateValidated: 0,
        dateRejected: 0,
        contact: submittedData.contact,
        carrier: submittedData.phoneCarrier,
        contactType: emailValidate.validate(submittedData.contact)? 'email': 'phone',
    }

    const options = submittedData.options.map(option => ({
            pageLink: option.option.pageLink,
            recordType: option.option.recordType
        }))

    return knex('AlertRequest').insert(alertRequest)
    .then(entered=> {
        const AlertRequestID = entered[0]
        return Promise.all(options.map(option => knex('AlertRequestData')
        .insert(Object.assign({}, option, {alertRequestID:AlertRequestID}) )
        .then( (AlertRequestDataId) => Object.assign({}, option, {alertRequestID:AlertRequestID, AlertRequestDataId:AlertRequestDataId[0]}) )
        ))
        .then(requestData => Object.assign({}, alertRequest, {alertRequestID:AlertRequestID, options:requestData}))
    })
}
//===========================================
const extractRequestFromEmail = (emailResponse) => {
    const matchLine = (line) => [/^On.*</, /wrote:$/, /^>/].reduce( (acc, val)=> acc || line.match(val), false)
    const origEmailLines = emailResponse.bodyData.replace('\r','').split('\r\n').filter(matchLine).map((line)=>line.replace(/^> ?/, ''))
    return  {
        alertRequestID:emailResponse.header.subject[0].replace(/.*#/,''),
        contact: emailResponse.header.from[0].match(/.*<(.*)>/)[1].trim(),
        header:origEmailLines[2] + ' ' +origEmailLines[3],
        options:origEmailLines.splice(5).filter(line=>line.length > 0).sort()
        .reduce( (acc,line)=> { // Line is formated as "groupname - recordType, recordType, ..."
            acc[line.split('-')[0].trim()] = line.split('-')[1].split(',').map(rec=>rec.trim())
            return acc
        },[])
    }
}
//===========================================
function authenticateAlertRequestResponse(knex, responseData) {
    const requestFromEmail = extractRequestFromEmail(responseData)

    return knex('AlertRequest')
        .select( ['AlertRequest.dateValidationSent','AlertRequest.contact', 'AlertRequestData.*'])
        .leftJoin('AlertRequestData', 'AlertRequestData.alertRequestID', 'AlertRequest.alertRequestID')
        .where('AlertRequestData.alertRequestID', requestFromEmail.alertRequestID)
        .orderBy("AlertRequestData.pageLink")
    .then(requestDataFromDB=> (requestDataFromDB.length === 0) ?
        Promise.reject("No matching ID:"+alertRequestID):
        Promise.resolve({
            alertRequestID: requestFromEmail.alertRequestID,
            contact: requestDataFromDB[0].contact,
            header: alertRequestHeaders[getContactType(requestDataFromDB[0].contact)].trim(),
            options:requestDataFromDB.map(rec=> ({pageLink:rec.pageLink, recordType:rec.recordType}))
                .reduce(recordTypeByPageLink, [])
        })
    )
    .then(requestEmailFromDB => {
        if(require('util').inspect(requestEmailFromDB, { depth: null }) === require('util').inspect(requestFromEmail, { depth: null })){
            return Promise.resolve(requestEmailFromDB)
        } else {
            return Promise.reject("Email/DB mismatch: \n" +
                require('util').inspect(requestFromEmail, { depth: null }) + '\n' + '!== \n' +
                require('util').inspect(requestEmailFromDB, { depth: null }));
        }
    })
}
//===========================================
function validateAlertRequest(knex, responseData) {
    return authenticateAlertRequestResponse(knex, responseData)
    .then( authenticated =>
        knex('AlertRequest').update({dateValidated:responseData.header.date|| new Date()})
        .where({alertRequestID:authenticated.alertRequestID, contact:authenticated.contact})
        .then(()=>
            Promise.resolve(Object.assign({},responseData,
                {id:authenticated.alertRequestID,
                    results:"Request " + authenticated.alertRequestID + ' from ' + authenticated.contact + ' Validated.'}
        ))
    )
    .catch( validationErr => {
        console.log('validationErr', validationErr);
    })
)
}

//===========================================
//===========================================
module.exports.contactTypes = contactTypes;
module.exports.submitAlertRequestData = submitAlertRequestData;
module.exports.sendVerifications = verifyAlertRequests;
module.exports.verifyAlertRequests = verifyAlertRequests;
module.exports.validateAlertRequest = validateAlertRequest;

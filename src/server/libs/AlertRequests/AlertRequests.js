var Config = require('../../config'),
configuration = new Config();

var knexConfig = require('../db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var emailValidate = require("email-validator");
var sendAutomationEmail = require('../emailProcessors/common').sendAutomationEmail;

let cellCarriers = require('./cellCarriers.json')

// Verizon
// We are currently investigating a technical issue that is preventing Verizon clients from signing up for text alerts.  If you use Verizon, please click here to give us your number.
//===========================================
const contactTypes = {
    PHONE : 'phone',
    EMAIL : 'email',
    UNK: 'unknown'
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
    return knexConnection("AlertRequest").where({alertRequestId: request.alertRequestId }).update({dateValidationSent: new Date() })
    .then(function (response) {
        console.log( 'dateValidationSent', response );
        return Promise.resolve(request)
    })
}
//===========================================
const alertRegistrationEmail = (destEmail, text, request) =>{
    text += Object.keys(request.options).map(option =>  option + ' - '+ request.options[option]).join('\n')

    // return dbValidationSent(knex, request )
    // .then(dbResult => {
    //     return Promise.resolve(Object.assign({}, request, {TBD:"***Not currently processing Alert emails.***"}) )
    // })

    return sendAutomationEmail(destEmail,  {
        subject: 'Requested alert registration. Request#'+request.alertRequestId,
        text: text,
    })
    .then(emailResult =>
        dbValidationSent(knex, request )
        .then(dbResult => {
            return Promise.resolve(Object.assign({},request, emailResult) )
        })
    )
}
//===========================================
function verifyPhoneAlertRequest(request) {
    let carrierData = cellCarriers.filter(carrier => carrier.Carrier == request.carrier )
    let destEmail = request.contact + '@' + carrierData[0].email;
    let text='Please reply to this text message to confirm your request to be alerted when the below items are posted:\n\n'

    return alertRegistrationEmail(destEmail, text, request)
}
//===========================================
function verifyEmailAlertRequest(request) {
    let text='Please reply to this email to confirm your request to be alerted when the below items are posted:\n\n'
    return alertRegistrationEmail(request.contact, text, request)
}
//===========================================
function verifyAlertRequests() {
    return knex("AlertRequest").select('alertRequestId','contact', 'contactType', 'carrier', 'dateRequested')
    .where('dateValidationSent', 0).orderBy('contact').orderBy('dateRequested', 'desc')
    .then(requestsToVerify => {
        const onlyFirstRecordForAContact = (acc, val) =>
            (acc.filter(elem=> elem.contact === val.contact).length === 0)?
            acc.concat(val):  acc

        return Promise.all(requestsToVerify.reduce( onlyFirstRecordForAContact, []).map(request=>
            knex("AlertRequestData").select().where("alertRequestId", request.alertRequestId).orderBy('pageLink')
            // .then(requestData => Object.assign({},request, {options:requestData}))
            .then(requestData => {
                return Promise.resolve( Object.assign({},request, {options: requestData.reduce( (acc, val) =>{
                acc[val.pageLink] = acc[val.pageLink]? acc[val.pageLink].concat(val.recordType):[val.recordType]
                return acc
                }, []) }))
            })
        ))
    })
    .then(requestsWithData => {
        return Promise.all(requestsWithData.filter(record=>record.contactType === 'email').map(verifyEmailAlertRequest))
        .then(emailsProcessed => {
            return Promise.all(requestsWithData.filter(record=>record.contactType === 'phone').map(verifyPhoneAlertRequest))
            .then(phonesProcessed => phonesProcessed.concat(emailsProcessed))
        })
    })
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
        .then((data)=> {
            return Promise.resolve(data)
        })
    })
}
//===========================================
function validateAlertRequest(knex, responseData) {
    const alertRequestID = responseData.header.subject[0].replace(/.*#/,'')
    const from  = responseData.header.from[0].match(/.*<(.*)>/)[1]
    const validationDate = responseData.header.date || new Date()

    return knex('AlertRequest').update({dateValidated:validationDate})
    .where({alertRequestID:alertRequestID, contact:from})
    .then( ()=>
    Promise.resolve(Object.assign({},responseData,
        {id:alertRequestID, results:"Request " + alertRequestID + ' from ' + from + ' Validated.'}
    ))
    )
}

//===========================================
//===========================================
if (require.main === module) {
    let knexConnection = knex

    const index=2;
    switch (process.argv[index]) {
        case 'verify':
            verifyAlertRequests(knexConnection)
            .then(emailsVerified => {
                console.log('Verifications sent:', emailsVerified);
            })
            .then(done => {
                process.exit();
            })
            break;
        case 'validate':
            validateAlertRequest(knexConnection,
                { header:{
                    from: [ "David Carpus <david.carpus@gmail.com>" ],
                    subject: [ 'Re: Requested alert registration. Request#5' ],
                    },
                    uid: 8,
                    bodyData: "Confirmed!\r\n\r\nOn Fri, Dec 22, 2017 at 11:16 AM Website automation <\r\nwebsite@newdurham.carpusconsulting.com> wrote:\r\n\r\n> Please reply to this email to confirm your request to be alerted when the\r\n> below items are posted:\r\n>\r\n> BoardofSelectmen - Documents,Minutes,Agenda\r\n> BoodeyFarmsteadCommittee - Notice\r\n> CyanobacteriaMediationSteeringCommittee - Documents\r\n> Home - RFP\r\n>\r\n",
                }
            )
            .then(requestValidated => {
                console.log('validateAlertRequest sent:', requestValidated);
            })
            .then(done => {
                process.exit();
            })
            break;

        default:
            console.log('Unknown parameter', process.argv[index]);
            console.log('Need cli parameter:', ['verify']);
            process.exit();
            break;
    }
}

//===========================================
module.exports.contactTypes = contactTypes;
module.exports.submitAlertRequestData = submitAlertRequestData;
module.exports.sendVerifications = verifyAlertRequests;
module.exports.verifyAlertRequests = verifyAlertRequests;
module.exports.validateAlertRequest = validateAlertRequest;

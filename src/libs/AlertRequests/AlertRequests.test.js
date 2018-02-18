var {
    verifyAlertRequests, validateAlertRequest
} = require('./AlertRequests.js')
var knexConnection = require('../../server/libs/db/common').getKnexConnection()
//===========================================
//===========================================
if (require.main === module) {
    switch (process.argv[2]) {
        case 'verify':
            verifyAlertRequests(knexConnection)
            .then(emailsVerified => {
                console.log('Verifications sent:', require('util').inspect(emailsVerified, { depth: null }));
            })
            .then(done => {
                process.exit();
            })
            break;
        case 'validate':
            validateAlertRequest(knexConnection,
                { header:{
                    from: [ "David Carpus <david.carpus@gmail.com>" ],
                    subject: [ 'Re: Requested alert registration. Request#1' ],
                    },
                    uid: 8,
                    // bodyData: `Confirmed!\r\n\r\nOn Fri, Dec 22, 2017 at 11:16 AM Website automation <\r\nwebsite@newdurham.carpusconsulting.com> wrote:\r\n\r\n> Please reply to this email to confirm your request to be alerted when the\r\n> below items are posted:\r\n> \r\n> BoardofSelectmen - Minutes\r\n> Town - RFP\r\n`
                    bodyData: `Confirmed!\r\n\r\nOn Fri, Dec 22, 2017 at 11:16 AM Website automation <\r\nwebsite@newdurham.carpusconsulting.com> wrote:\r\n\r\n> Please reply to this email to confirm your request to be alerted when the\r\n> below items are posted:\r\n> \r\n> BoardofSelectmen - Minutes,Agenda\r\n> Town - RFP\r\n`
                    // bodyData: "Confirmed!\r\n\r\nOn Fri, Dec 22, 2017 at 11:16 AM Website automation <\r\nwebsite@newdurham.carpusconsulting.com> wrote:\r\n\r\n> Please reply to this email to confirm your request to be alerted when the\r\n> below items are posted:\r\n>\r\n> BoardofSelectmen - Documents,Minutes,Agenda\r\n> BoodeyFarmsteadCommittee - Notice\r\n> CyanobacteriaMediationSteeringCommittee - Documents\r\n> Home - RFP\r\n>\r\n",
                }

            )
            .then(requestValidated => {
                console.log('validateAlertRequest sent:', requestValidated);
            })
            .then(done => {
                process.exit();
            })
            .catch(validationErr => {
                console.log('Main: validationErr', validationErr);
                process.exit();
            })
            break;

        default:
            console.log('Unknown parameter', process.argv[2]);
            console.log('Need cli parameter:', ['verify', 'validate']);
            process.exit();
            break;
    }
}

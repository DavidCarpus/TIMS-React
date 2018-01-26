var express = require('express');
var bodyParser = require('body-parser')
var router = express.Router();              // get an instance of the express Router
var Config = require('../config'),
configuration = new Config();
const crc = require('crc');
var addWeeks = require('date-fns/add_weeks');
var addMonths = require('date-fns/add_months');

const launchedViaCLI = () =>  typeof process.env.SPAWNED === 'undefined'

var fs      = require('fs');
var imaps = require('imap-simple');
var knexConfig = require('../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var IMapProcessor = require('../libs/imap').IMapProcessor;
let imap = new IMapProcessor(configuration.imapProcess);

var pullEventsFromICS = require('../libs/calendar/ICSCalendar.js').pullEventsFromICS
var icsEventToDBRecord = require('../libs/calendar/ICSCalendar.js').icsEventToDBRecord


var enterOnlyIntoTable = require('../libs/db/common').enterOnlyIntoTable;
var addOrUpdateTable = require('../libs/db/common').addOrUpdateTable;

var verifyAlertRequests = require('../libs/AlertRequests').verifyAlertRequests

var addedEvents = {}

const calendarProcessPort = configuration.expressPort+2
var  calendar = require('../libs/calendar');

const debugLog =(...args)=> {
    // const output = `{"${args[0]}":[` +
    //     args.splice(1).map(arg=> require('util').inspect(arg, { depth: null })).join(' ') + `]}\n`
    const output = `{"${args[0]}":[` +
        args.splice(1).map(arg=> JSON.stringify(arg)).join(' ') + `]}\n`
    process.stdout.write(output);
}

const privateDir = configuration.PRIVATE_DIR
// const mode = process.env.NODE_ENV||'development'
// const privateDir = (mode === 'development')?
// '../private/'+process.env.REACT_APP_MUNICIPALITY :
// '../private/'

// const icsFilePath = (mode === 'development')?
// "file://" + configuration.ROOT_DIR+'/' + privateDir + '/export.ics' :
// "file://" + privateDir + '/export.ics'
const icsFilePath = "file://" + privateDir + '/export.ics'

debugLog('icsFilePath', icsFilePath);

//---------------------------------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
//---------------------------------------------
process.stdout.setEncoding('utf8');
process.on('uncaughtException', function (err) {
  debugLog('Calendar process:' , err);
})
//---------------------------------------------
var app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
//---------------------------------------------
app.use('/api', router);
// //---------------------------------------------
function calendarProcess(delay, count=2) {
    // return pullEventsFromICS('http://www.newdurhamnh.us/calendar/ical/export.ics')
    // return pullEventsFromICS('file:///home/dcarpus/Downloads/export.ics')
    return pullEventsFromICS(icsFilePath)
    .then(events=> {// addDays(new Date(), -7),addDays(new Date(), 28)
        // debugLog('Pulled events', events.length);
        let addCnt=0
        const lastRunDate = addMonths(new Date(), -12)

        return Promise.all(events
            .filter(evnt=> evnt.modifiedDate > lastRunDate)
            .map(evnt=> {
                delete evnt.complex
                // delete evnt.modifiedDate

            if(evnt.months) evnt.months = evnt.months.join(',')
            if (addedEvents[crc.crc32(JSON.stringify(evnt))] !== evnt.uid) {
                addedEvents[crc.crc32(JSON.stringify(evnt))] = evnt.uid
                // debugLog('Push to server', evnt.uid)
                addCnt++
                const dbRec = icsEventToDBRecord(evnt)
                // return Promise.resolve(evnt)
                return addOrUpdateTable(knex, 'CalendarEvents',
                dbRec,{ uid: dbRec.uid, startDate: dbRec.startDate})
                // return addOrUpdateTable(knex, "CalendarEvents", evnt, {uid:evnt.uid})
            } else {
                return Promise.resolve(evnt)
            }
        }))
        .then(newAdded => {
            // debugLog('processed', newAdded.length, 'Added',addCnt);
            return addCnt
        })
    })
    .then(additions => {
        if (additions > 0) {
            debugLog('CalendarEvent additions/updates',additions)
        }

        return sleep(delay).then(out =>{
            if (count > 0) {
                return calendarProcess(delay, ++count)
            } else {
                process.exit();
            }
        })
    })
    .catch(err => {
        console.log('importCalendarEvents Error:', err);
        process.exit();
    })
}
debugLog('Starting up calendarProcessing');
const index=2;
launchedViaCLI() && debugLog('debug via cli');
if(!launchedViaCLI()) debugLog('debug via express');
debugLog("calendarProcessPort", launchedViaCLI()?calendarProcessPort+10:calendarProcessPort);
//======================================
if (require.main === module) {
    app.set('port', launchedViaCLI()?calendarProcessPort+10:calendarProcessPort);
    app.listen(app.get('port'), 'localhost');
    calendarProcess(60000,2)
    .then( ()=> process.exit())
}

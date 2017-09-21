var express = require('express');
var logger = require('morgan');
var compression = require('compression')
var fs = require('fs');
var https = require('https');
var bodyParser = require('body-parser')
const passport = require('passport');
// var busboy = require('connect-busboy');

var Config = require('./config'),
configuration = new Config();

var knexConfig = require('./libs/db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var routes = require('./routes/index').router;

var app = express();

// app.use(busboy());
// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const localSignupStrategy = require('./libs/passport/local-signup');
const localLoginStrategy = require('./libs/passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

//===============================================
var IMapProcessor = require('./libs/imap').IMapProcessor;
let imap = new IMapProcessor(configuration.imapProcess);

var emailSubmit = require('./libs/emailProcessors').submit;
var sendAutomationEmail = require('./libs/emailProcessors/common').sendAutomationEmail;
var sendVerifications = require('./libs/AlertRequests').sendVerifications;

var  calendar = require('./libs/calendar');

//===============================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
//===============================================
function alertVerificationProcess(delay, count=2) {
    return sendVerifications(knex)
    .then(results => {
        // console.log(results);
        return Promise.resolve('Done')
    })
    .then(done => {
        return sleep(delay).then(out =>{
            if (count > 0) {
                --count;
                if (configuration.alertVerificationProcess.infinite) {
                    ++count;
                }
                return alertVerificationProcess(delay, count)
            } else {
                process.exit();
            }
        })
    } )

}

//===============================================
function calendarProcess(delay, count=2) {
    return calendar.importCalendarEvents(knex)
    .then(results => {
        // console.log(results);
        return Promise.resolve('Done')
    })
    .then(done => {
        return sleep(delay).then(out =>{
            if (count > 0) {
                --count;
                if (configuration.calendarProcess.infinite) {
                    ++count;
                }
                return calendarProcess(delay, count)
            } else {
                process.exit();
            }
        })
    } )

}

//===============================================
function imapProcess(delay, count=2) {
    imap.process()
    .then(imapResults => {
        // console.log('imapProcess imapResults:' + require('util').inspect(imapResults, { depth: null }));
        // console.log('--------------');
        return Promise.all(imapResults.map(entry => {
            return emailSubmit(entry, imap)
            .catch(submissionError => {
                console.log('submissionError:' , submissionError);
                return Promise.resolve(entry)
            });
        }))
    })
    .then(processedEmails => {
        // console.log('processedEmails:' + require('util').inspect(processedEmails, { depth: null }));
        return Promise.all(processedEmails.map(insertedEmail => {
            let singleEmail = insertedEmail;
            if (Array.isArray(singleEmail)) {                singleEmail = singleEmail[0];            }
            if (Array.isArray(singleEmail)) {                singleEmail = singleEmail[0];            }

            // console.log('ID:', singleEmail);
            if (typeof singleEmail.err !== 'undefined' || typeof singleEmail.id === 'undefined') {
                console.log('****' , singleEmail.err);
                return sendAutomationEmail(singleEmail.header.from,
                    {subject:"RE:" + singleEmail.header.subject,
                    text:'ERROR:' + '\n' + singleEmail.err.join('\n') + '\n' + '==================\n' + singleEmail.bodyData})
                .then( mailSent =>{
                    return Promise.resolve(imap.archiveMessage(singleEmail.uid, 'Errors'));
                })

                err = 'Email not processed to DB.' + JSON.stringify(singleEmail);
                console.log(err);
            }
            return Promise.resolve(imap.archiveMessage(singleEmail.uid, 'Processed'));
        }))
    })
    .then(entryResults => { // Loop imapProcess
        if (entryResults.length > 0) {
            console.log("Processed emails:" , entryResults);
        }
        return sleep(delay).then(out =>{
            if (count > 0) {
                --count;
                if (configuration.imapProcess.infinite) {
                    ++count;
                }
                return imapProcess(delay, count)
            } else {
                process.exit();
            }

        })
    })
    // .catch(err => {
    //     console.log('IMAP processing error:' + err);
    // })
}
//===============================================
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//https://github.com/expressjs/morgan
logger.token('ts', function getTs (req) {
  return req.ts
})
app.use(timestamp)
// if (process.env.NODE_ENV !== 'test') {
    app.use(logger(':ts :method :url :response-time'))
  // app.use(logger('dev'));
// } else {
//     app.use(logger('combined'))
// }

function timestamp (req, res, next) {
    var d = new Date();
    req.ts = d.toString().replace('GMT-0400 (EDT)', '');
    next()
}

app.set('port', configuration.expressPort);
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', routes);

// error handlers

// app.use(compression())

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

if (configuration.sslOptions) {
    console.log('Found sslOptions, configuring...');
    var sslOptions = {
         key: fs.readFileSync(configuration.sslOptions.keyPath),
        cert: fs.readFileSync(configuration.sslOptions.certPath)
    };

    let httpsPort = (parseInt(configuration.expressPort)+100);
    https.createServer(sslOptions, app).listen( httpsPort );
    let d = new Date();
    let ts = d.toString().replace('GMT-0400 (EDT)', '');
    console.log(ts + ' HTTPS Express server listening on port ' + (httpsPort ) );
}


app.listen(app.get('port'));
let d = new Date();
let ts = d.toString().replace('GMT-0400 (EDT)', '');
console.log(ts+ ' Express server listening on port ' + app.get('port'));

console.log(configuration.mode + " mode");
switch (configuration.mode) {
    case 'development':
        // console.log('Imap process every', configuration.imapProcess.delay/1000, 'seconds', (configuration.imapProcess.infinite)?'inf.':'NOT inf.' );
        // imapProcess(configuration.imapProcess.delay, 50);
        console.log('GCalendar process every', configuration.calendarProcess.delay/1000, 'seconds', (configuration.calendarProcess.infinite)?'inf.':'NOT inf.');
        calendarProcess(configuration.calendarProcess.delay, 50)
        console.log('alertVerification process every', configuration.alertVerificationProcess.delay/1000, 'seconds', (configuration.alertVerificationProcess.infinite)?'inf.':'NOT inf.');
        alertVerificationProcess(configuration.alertVerificationProcess.delay, 50)
        break;
    case 'production':
        console.log('Imap process every', configuration.imapProcess.delay/1000, 'seconds', (configuration.imapProcess.infinite)?'inf.':'NOT inf.');
        imapProcess(configuration.imapProcess.delay, 50);
        console.log('GCalendar process every', configuration.calendarProcess.delay/1000, 'seconds', (configuration.calendarProcess.infinite)?'inf.':'NOT inf.');
        calendarProcess(configuration.calendarProcess.delay, 50)
        break;
    case 'test':
        // ****** The 'Test' site email processing currently crashes the system.
        // ****** Problem with SSL certificates and email server
        console.log('GCalendar process every', configuration.calendarProcess.delay/1000, 'seconds', (configuration.calendarProcess.infinite)?'inf.':'NOT inf.');
        calendarProcess(configuration.calendarProcess.delay, 50)

        break;
    default:

}

// http://handyjs.org/article/the-kick-ass-guide-to-creating-nodejs-cron-tasks

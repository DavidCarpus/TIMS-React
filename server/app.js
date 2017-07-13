var express = require('express');
var logger = require('morgan');
var compression = require('compression')
var fs = require('fs');
var https = require('https');

var Config = require('./config'),
configuration = new Config();

var knexConfig = require('./libs/db/knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var routes = require('./routes/index').router;
var handleDisconnect = require('./routes/index').handleDisconnect;

var app = express();

handleDisconnect(); // open (and keep open) a database connection used by routes
//===============================================
var IMapProcessor = require('./libs/imap').IMapProcessor;
let imap = new IMapProcessor(configuration.imapProcess);

var emailSubmit = require('./libs/emailProcessors').submit;
var sendAutomationEmail = require('./libs/emailProcessors/common').sendAutomationEmail;

var  calendar = require('./libs/calendar');

//===============================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

Date.prototype.datetimestr = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();
  var hh = this.getHours();
  var MM = this.getMinutes();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd,
          (hh>9 ? '' : '0') + hh,
          (MM>9 ? '' : '0') + MM,

         ].join('');
};
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
if (configuration.mode !== 'development') {
    var sslOptions = {
      key: fs.readFileSync('/home/carpusco/ssl/keys/9c0b4_2b379_71d7c09aa2fe8da6ef8ce0d771721ef2.key'),
      cert: fs.readFileSync('/home/carpusco/ssl/certs/carpusconsulting_com_9c0b4_2b379_1506265500_c15e95dd9e5148c14cc4dd37f0181f0c.crt')
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
            console.log('configuration.calendarProcess.infinite:' , configuration.calendarProcess.infinite);
            console.log('configuration.calendarProcess.delay:' , configuration.calendarProcess.delay);
            calendarProcess(configuration.calendarProcess.delay, 50)
        break;
    case 'production':
        console.log('configuration.imapProcess.infinite:' , configuration.imapProcess.infinite);
        console.log('configuration.imapProcess.delay:' , configuration.imapProcess.delay);
        imapProcess(configuration.imapProcess.delay, 50);
        console.log('configuration.calendarProcess.infinite:' , configuration.calendarProcess.infinite);
        console.log('configuration.calendarProcess.delay:' , configuration.calendarProcess.delay);
        calendarProcess(configuration.calendarProcess.delay, 50)
        break;
    case 'test':
        // ****** The 'Test' site email processing currently crashes the system.
        // ****** Problem with SSL certificates and email server

        // console.log('configuration.imapProcess.infinite:' , configuration.imapProcess.infinite);
        // console.log('configuration.imapProcess.delay:' , configuration.imapProcess.delay);
        // imapProcess(configuration.imapProcess.delay, 50);

        console.log('configuration.calendarProcess.infinite:' , configuration.calendarProcess.infinite);
        console.log('configuration.calendarProcess.delay:' , configuration.calendarProcess.delay);
        calendarProcess(configuration.calendarProcess.delay, 50)

        break;
    default:

}

// if (configuration.mode == 'development') {
//     console.log("Development mode");
//     // imapProcess(configuration.imapProcess.delay, 50);
//     // console.log('configuration:' , configuration);
// } else {
//     console.log('configuration.imapProcess.infinite:' , configuration.imapProcess.infinite);
//     console.log('configuration.imapProcess.delay:' , configuration.imapProcess.delay);
//     imapProcess(configuration.imapProcess.delay, 50);
// }
//


// http://handyjs.org/article/the-kick-ass-guide-to-creating-nodejs-cron-tasks

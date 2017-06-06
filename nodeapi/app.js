var express = require('express');
var logger = require('morgan');
var compression = require('compression')

var Config = require('./config'),
configuration = new Config();

var routes = require('./routes/index').router;
var handleDisconnect = require('./routes/index').handleDisconnect;

var app = express();

handleDisconnect(); // open (and keep open) a database connection used by routes
//===============================================
var IMapProcessor = require('./libs/imap').IMapProcessor;
let imap = new IMapProcessor(configuration.imapProcess);

var emailSubmit = require('./libs/emailProcessors').submit;
//===============================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
//===============================================
function imapProcess(delay, count=2) {
    imap.process()
    .then(results => { // Submit email data into database
        return Promise.all(results.map(entry => {
            return emailSubmit(entry, imap);
        }))
    })
    .then(processedEmails => { // Archive emails on imap server
        return Promise.all(processedEmails.map(insertedEmail => {
            let destFolder = 'Processed';
            if (typeof insertedEmail[0].err != 'undefined') { destFolder = 'Errors';}
            return Promise.resolve(imap.archiveMessage(insertedEmail[0].uid, destFolder));
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
    .catch(err => {
        console.log('IMAP processing error:' + err);
    })
}
//===============================================

//https://github.com/expressjs/morgan
logger.token('ts', function getTs (req) {
  return req.ts
})
app.use(timestamp)
if (process.env.NODE_ENV !== 'test') {
    app.use(logger(':ts :method :url :response-time'))
  // app.use(logger('dev'));
// } else {
//     app.use(logger('combined'))
}

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

app.listen(app.get('port'));
let d = new Date();
let ts = d.toString().replace('GMT-0400 (EDT)', '');
console.log(ts+ ' Express server listening on port ' + app.get('port'));

if (configuration.mode == 'development') {
    console.log('configuration:' , configuration);
} else {
    console.log('configuration.imapProcess.infinite:' , configuration.imapProcess.infinite);
    console.log('configuration.imapProcess.delay:' , configuration.imapProcess.delay);
}
imapProcess(configuration.imapProcess.delay, 50);



// http://handyjs.org/article/the-kick-ass-guide-to-creating-nodejs-cron-tasks

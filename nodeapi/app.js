var express = require('express');
var logger = require('morgan');
var compression = require('compression')

var Config = require('./config'),
configuration = new Config();

var routes = require('./routes/index').router;
var handleDisconnect = require('./routes/index').handleDisconnect;

var app = express();
// console.log(configuration);

handleDisconnect();

//===============================================
var IMapProcessor = require('./imap').IMapProcessor;
let imap = new IMapProcessor(configuration.imapcredentials, configuration.paths.notices);

var NoticeProcessor = require('./db/NoticeProcessor').NoticeProcessor;
var noticeProcessor = new NoticeProcessor()

//===============================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
//===============================================
function imapProcess(delay, count=2) {
    // console.log("Starting imap.process,");
imap.process()
.then(results => {
    // console.log('results:',results);
    // return Promise.resolve(results);
    return Promise.all(results.map(entry => {
        if (typeof entry.err != 'undefined') { // Bad emails. Move to 'Errors'
        return imap.archiveMessage(entry.uid, 'Errors')
        .then(archiveResults => {
            console.log('Moved email to Errors:', archiveResults);
            return Promise.resolve(archiveResults);
        })
        .catch(moveErr => {
            console.log('moveErr:', moveErr);
            return Promise.reject('moveErr:'+ moveErr);
        })

    } else {
        return noticeProcessor.process( entry)
        .then(resultLogged => {
            return imap.archiveMessage(entry.uid, 'Processed')
            .then(archiveResults => {
                console.log('Moved email to Processed:', archiveResults);
                return Promise.resolve(archiveResults);
            })
            .catch(moveErr => {
                console.log('moveErr:', moveErr);
                return Promise.reject('moveErr:'+ moveErr);
            })
        })
    } // 'Valid entries'
}))

})
.then(entryResults => {
    // console.log("Completed imap.process." + count);
    // process.exit();
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
    // return Promise.resolve(entryResults);

})
.catch(err => {
    console.log('IMAP processing error:' + err);
    process.exit();
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
console.log('Express server listening on port ' + app.get('port'));

if (configuration.mode == 'development') {
    console.log('configuration:' , configuration);
} else {
    console.log('configuration.imapProcess.infinite:' , configuration.imapProcess.infinite);
    console.log('configuration.imapProcess.delay:' , configuration.imapProcess.delay);
}


imapProcess(configuration.imapProcess.delay, 50);

// http://handyjs.org/article/the-kick-ass-guide-to-creating-nodejs-cron-tasks

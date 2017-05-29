var express = require('express');
var logger = require('morgan');
var Config = require('./config'),
configuration = new Config();

var routes = require('./routes/index').router;
var handleDisconnect = require('./routes/index').handleDisconnect;

var app = express();

handleDisconnect();

//https://github.com/expressjs/morgan
logger.token('ts', function getTs (req) {
  return req.ts
})
app.use(timestamp)
if (process.env.NODE_ENV !== 'test') {
    app.use(logger(':ts :method :url :response-time'))
  // app.use(logger('dev'));
}
// app.use(logger('combined'))

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


// http://handyjs.org/article/the-kick-ass-guide-to-creating-nodejs-cron-tasks

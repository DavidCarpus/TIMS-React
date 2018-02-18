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

var ProcessManagement = require('./processes/processManagement').ProcessManagement
var processManagement = new ProcessManagement(configuration)

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
// var IMapProcessor = require('./libs/imap').IMapProcessor;
// let imap = new IMapProcessor(configuration.imapProcess);
// var emailSubmit = require('./libs/emailProcessors').submit;
// var sendAutomationEmail = require('./libs/emailProcessors/common').sendAutomationEmail;
// var sendVerifications = require('../libs/AlertRequests').sendVerifications;

//===============================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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


// development error handler
// will print stacktrace
if (app.get('env') !== 'development') {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: {}
        });
    });
}

if (configuration.sslOptions) {
    console.log('Found sslOptions, configuringexpressPort...');
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

console.log(process.env.REACT_APP_MUNICIPALITY);
console.log(configuration.mode + " mode");

if(configuration.mode === 'development')   return

// if (configuration.imapProcess) {
//     processManagement.initializeEmailService()
// }
processManagement.initializeCalendarService()
app.set('processManagement', processManagement);

// http://handyjs.org/article/the-kick-ass-guide-to-creating-nodejs-cron-tasks

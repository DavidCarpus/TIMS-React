var readline      = require('readline');
const { spawn } = require('child_process');
const baseCmd = 'node'

class ProcessManagement {
    constructor(conf){
        this.config = conf;
        this.services = []
    }
    initializeEmailService() {
        // ****** The 'Test' site email processing currently crashes the system.
        // ****** Problem with SSL certificates and email server
        const spawnedEnv= {env: Object.assign({}, process.env, { SPAWNED: 1 } ) }
        // console.log(__dirname+'/'+'emailProcessing.js');
        this.services['email'] = spawn(baseCmd, [__dirname+'/'+'emailProcessing.js'], spawnedEnv );

        this.services['email'].on('exit', (code, signal) =>
            console.log('email process exited with ' + `code ${code} and signal ${signal}`)
        )
        readline.createInterface({
            input: this.services['email'].stdout,
            terminal: false
        }).on('line', function(line) {
            console.log(`this.services['email']:${line}`)
        });

        this.services['email'].on('close', (data) => {
            process.stdout.write(`this.services['email'] close:${data}\n`)
            // respan=true
        });
        // process.stdin.pipe(this.services['email'].stdin);
        // respan=false
    }
    initializeCalendarService() {
         if(configuration.mode === 'development')   return
         // var calendarProcess = require('./libs/calendar/ICSCalendar').calendarProcess;
         // console.log('ICSCalender process every', configuration.calendarProcess.delay/1000, 'seconds', (configuration.calendarProcess.infinite)?'inf.':'NOT inf.');
         // calendarProcess(configuration.calendarProcess.delay, configuration.calendarProcess.infinite, 50)
         // console.log('GCalendar process every', configuration.calendarProcess.delay/1000, 'seconds', (configuration.calendarProcess.infinite)?'inf.':'NOT inf.');
         // calendarProcess(configuration.calendarProcess.delay, 50)

        const spawnedEnv= {env: Object.assign({}, process.env, { SPAWNED: 1 } ) }
        console.log(__dirname+'/'+'calendarProcessing.js');
        this.services['calendar'] = spawn(baseCmd, [__dirname+'/'+'calendarProcessing.js'], spawnedEnv );

        this.services['calendar'].on('exit', (code, signal) =>
            console.log('calendar process exited with ' + `code ${code} and signal ${signal}`)
        )
        readline.createInterface({
            input: this.services['calendar'].stdout,
            terminal: false
        }).on('line', function(line) {
            console.log(`this.services['calendar']:${line}`)
        });

        this.services['calendar'].on('close', (data) => {
            process.stdout.write(`this.services['calendar'] close:${data}\n`)
            // respan=true
        });
        // process.stdin.pipe(this.services['calendar'].stdin);
        // respan=false
    }
}

module.exports.ProcessManagement = ProcessManagement;

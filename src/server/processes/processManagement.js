var readline      = require('readline');
const { spawn } = require('child_process');
const baseCmd = 'node'
const runningConfigs = {}

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
        this.services['email'] = {}
        this.services['email'].process = spawn(baseCmd, [__dirname+'/'+'emailProcessing.js'], spawnedEnv );
        runningConfigs['email'] = {}

        this.services['email'].process.on('exit', (code, signal) =>
            console.log('email process exited with ' + `code ${code} and signal ${signal}`)
        )
        readline.createInterface({
            input: this.services['email'].process.stdout,
            terminal: false
        }).on('line', function(line) {
            console.log(`this.services['email']:${line}`)
        });

        this.services['email'].process.on('close', (data) => {
            process.stdout.write(`this.services['email'] close:${data}\n`)
            // respan=true
        });
        // process.stdin.pipe(this.services['email'].stdin);
        // respan=false
    }
    getConfig(desc){
        // return this.services[desc].config
        return runningConfigs[desc]
    }
    initializeCalendarService() {
        const serviceName = 'calendar'
         // var calendarProcess = require('./libs/calendar/ICSCalendar').calendarProcess;
         // console.log('ICSCalender process every', configuration.calendarProcess.delay/1000, 'seconds', (configuration.calendarProcess.infinite)?'inf.':'NOT inf.');
         // calendarProcess(configuration.calendarProcess.delay, configuration.calendarProcess.infinite, 50)
         // console.log('GCalendar process every', configuration.calendarProcess.delay/1000, 'seconds', (configuration.calendarProcess.infinite)?'inf.':'NOT inf.');
         // calendarProcess(configuration.calendarProcess.delay, 50)

        const spawnedEnv= {env: Object.assign({}, process.env, { SPAWNED: 1 } ) }
        console.log(__dirname+'/'+'calendarProcessing.js');
        this.services[serviceName] = {}
        this.services[serviceName].process = spawn(baseCmd, [__dirname+'/'+'calendarProcessing.js'], spawnedEnv );

        this.services[serviceName].process.on('exit', (code, signal) =>
            console.log('calendar process exited with ' + `code ${code} and signal ${signal}`)
        )
        readline.createInterface({
            input: this.services[serviceName].process.stdout,
            terminal: false
        }).on('line', function(line) {
            // console.log('----------');
            try {
                const data = JSON.parse(line);
                if(data["calendarProcessPort"]){
                    runningConfigs[serviceName] = Object.assign({},runningConfigs[serviceName] ,{calendarProcessPort:data["calendarProcessPort"][0]})
                    line = ""
                }
                // console.log('calendar.config', conf);
            } catch (e) {
                console.log('JSON.parse err', line);
                console.log(e);
            } finally {
                if(line.length > 0)
                    console.log(`this.services[serviceName]:line:${line}`)
            }
            // console.log('calendar.config', runningConfigs[serviceName]);
        });

        readline.createInterface({
            input: this.services[serviceName].process.stderr,
            terminal: false
        }).on('line', function(line) {
            console.log(`this.services[serviceName] Error:${line}`)
        });

        this.services[serviceName].process.on('close', (data) => {
            process.stdout.write(`this.services[serviceName] close:${data}\n`)
            // respan=true
        });
        // process.stdin.pipe(this.services[serviceName].stdin);
        // respan=false
    }
}

module.exports.ProcessManagement = ProcessManagement;

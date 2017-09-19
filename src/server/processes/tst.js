// process.stdin.resume();
var readline      = require('readline');

process.on('exit', () => {
    console.log('Exiting  main process');
    if (imapP) {
        imapP.kill('SIGINT');
        // imapP.stdin.write(JSON.stringify({test:99, str:'.'}))
    }
});

process.stdin.setEncoding('utf8');
let sendObj = {test: 1, str: "Some String"}

const { spawn } = require('child_process');
let imapP;
let cnt=0
let respan=true

function spawnImap() {
    const spawnedEnv= {env: Object.assign({}, process.env, { SPAWNED: 1 } ) }
    imapP = spawn('node', ['imapServerAccess.js'], spawnedEnv );

    imapP.on('exit', (code, signal) =>  console.log('imapP process exited with ' + `code ${code} and signal ${signal}`) );

    // imapP.stdout.on('data', (data) => {
    //     process.stdout.write(`**** imapP stdout:\n${data}`)
    // });

// https://stackoverflow.com/questions/20270973/nodejs-spawn-stdout-string-format
    readline.createInterface({
        input: imapP.stdout,
        terminal: false
    }).on('line', function(line) {
        // process.stdout.write('**************************************************\n')
        // process.stdout.write(`imapP line:\n${line}`)
        let obj = {}
        try {
            obj = JSON.parse(line.toString());
        } catch (e) {
            console.log('JSON.parse err:', e);
            obj = line
        } finally {

        }
        console.log(require('util').inspect(obj, { depth: null }));
    });


    imapP.on('close', (data) => {
        // process.stdout.write(`imapP close:${data}\n`)
        sendObj.test = 1
        respan=true
    });
    // process.stdin.pipe(imapP.stdin);
    respan=false


}


const intervalObj = setInterval(() => {
    if (respan) {
        spawnImap()
    }
    // console.log('Controller check', cnt);
    sendObj.test++
    sendObj.str += '.'
    imapP.stdin.write(JSON.stringify(sendObj))
    if (cnt++ > 22) {
        process.exit();
    }
}, 1 * 1000); // seconds * 1000 milsec

// console.log('Controller check?');
spawnImap()

// process.stdin.pipe(imapP.stdin);

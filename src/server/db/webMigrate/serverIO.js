var fs = require('fs');
var axios = require("axios");
var Config = require('../../config'),
configuration = new Config();
// var wget = require('node-wget');
var wget = require('./wget');

const privateDir = '../private/'+process.env.REACT_APP_MUNICIPALITY;

const localFileURL = '/home/dcarpus/code/milton_nh/currentMiltonWebsite/miltonnh-us.com'
let serverPath = '/home/carpusco/test.miltonnh.us/private/Attachments/'

if (configuration.mode === 'development') {
    // logErrors = true
    serverPath = privateDir + '/Attachments/'
} else if  (configuration.mode === 'production') {
    serverPath = '/home/carpusco/miltonnh.us/private/Attachments/'
}

let Client = require('ssh2-sftp-client');
let pk=require('fs').readFileSync('/home/dcarpus/.ssh/id_rsa');
let sftp = new Client();
var connSettings = {
    host: 'carpusco.wwwss29.a2hosted.com',
    port: '7822',
    username: 'carpusco',
    privateKey: pk
};
let sftpPromise=null

module.exports = {
    pullLocalCopies : pullLocalCopies,
    pullNewServerDirs : pullNewServerDirs,
    pushFileToServer: pushFileToServer,
    fetchURL:fetchURL,
    getServerFilePath:getServerFilePath,
    // initSFTP:initSFTP,
    getSourceServerHost:getSourceServerHost,
}

function initSFTP() {    if (sftpPromise==null)     sftpPromise = sftp.connect(connSettings)  }

function getSourceServerHost() {  return 'miltonnh-us.com' }
function getServerFilePath() {    return serverPath }
// let getServerFilePath = () => serverPath
let matchHost = (host, uri) => uri.indexOf(host) !== -1
let miltonnhusURI = (uri) => matchHost('miltonnh-us', uri)
let localFileExists = (fullPath) => fs.existsSync(fullPath)
let localFileMissing = (fullPath) => !localFileExists(fullPath)

let baseURI = (host, uri) =>  uri.replace(new RegExp('https?://' + host + '/?'), '')
let baseURIpath = (host, uri) =>
    uri.replace(new RegExp('https?://' + host + '/?'), '').match(/(.*)\//) ?
    uri.replace(new RegExp('https?://' + host + '/?'), '').match(/(.*)\//)[1]+'/':
    '/'
let localPathFromURI = (localBasePath, host, uri) =>localBasePath + '/' + baseURI(host, uri)
//========================================
function pullLocalCopies(records) {
    let missingFiles = records.filter(rec => miltonnhusURI(rec.uri))
    // console.log('pullLocalCopies', records.length);

    return Promise.all(
        missingFiles.map(rec => {
            let dest =localPathFromURI(localFileURL, 'miltonnh-us.com', rec.uri)
            // console.log('Check:', dest);
            if (localFileMissing(dest) ) {
                // return pullLocalCopy(localFileURL, 'miltonnh-us.com', rec.uri)
                return new Promise(function(resolve, reject) {
                    wget( {url: rec.uri, dest: dest}, (err, response) => {
                        if (err) {
                            reject(err)
                        } else {
                            rec.dest = dest
                            resolve(rec)
                        }
                    } )
                })
                .then(dest => {
                    rec.dest = dest
                    return rec
                })
            } else {
                rec.local = localPathFromURI( localFileURL, 'miltonnh-us.com', rec.uri)
                return Promise.resolve(rec)
            }
        })
    )
    .then(done => {
        // console.log('pulledLocalCopies', records.length);
        return records
    } )
}
//========================================
function pullNewServerDirs(baseServerPath, pathsToDir) {
    let serverDirs = {}
    // Pull directories from a server using SFTP
    if (configuration.mode !== 'development') {
        initSFTP()
        return Promise.all(
             pathsToDir.map( pathToDir => {
                let fullPath = baseServerPath + pathToDir
                return sftpPromise.then(() => {
                    return sftp.list(fullPath);
                })
                .then((data) => {
                    // console.log('data:', data);
                    serverDirs[pathToDir]  =data
                    return data.map(rec=> pathToDir+'/' +rec.name)
                })
                .catch((err) => {
                    console.log('**sftp err:', fullPath , err);
                })
            })
        )
        .then(fileNames => {
            return fileNames
        })
    } else {
        // Pull directories 'LOCAL' with fs library
        return Promise.all( pathsToDir.map( pathToDir => {
            return new Promise(function(resolve, reject) {
                fs.readdir(baseServerPath + pathToDir, function(err, items) {
                    if(err)  reject('Missing path ' + baseServerPath + pathToDir)
                    else {
                        resolve (items.map(item => pathToDir+'/' + item) )
                    }
                });
            })
        }))
        .then(allPathItems => {
            return allPathItems
        })
    } // else
}
//========================================
function pushFileToServer( fullPathLocalFile, serverDest ) {
    if (configuration.mode !== 'development') {
        return  sftpPromise
        .then( () => {
            return sftp.put(fullPathLocalFile, serverDest, true ) ///Param 3=useCompression
        })
        .then( (data) => {
            // console.log('Uploaded:', serverDest.replace(/.*\//, ''));
            return Promise.resolve(serverDest)
        })
        .catch(err => {
            console.log("sftpPromise:put err", serverDest);
            // reject("sftpPromise:err", err);
            Promise.resolve("**sftpPromise:put err", serverDest);
        })
    } else {
        return new Promise(function(resolve, reject) {
            console.log('Copy file to "Server" location .. ', fullPathLocalFile, 'as', serverDest);
            if (!serverDest || serverDest.length === 0 || !fullPathLocalFile || fullPathLocalFile.length === 0) {
                // console.log('**** Invalid "Server" location .. ' serverDest);
                return Promise.reject('**** Invalid "Server" paths .. ' + fullPathLocalFile + ' -- ' + serverDest)
            }
            var rd = fs.createReadStream(fullPathLocalFile);
            rd.on("error", function(err) { reject(err); });
            var wr = fs.createWriteStream(serverDest);
            wr.on("error", function(err) { reject(err); });
            wr.on("close", function(ex) { resolve(serverDest); });
            rd.pipe(wr);
            // fs.createReadStream(fullPathLocalFile).pipe(fs.createWriteStream(serverDest));
        })
    } // else
}
//========================================
function fetchURL(url) {
    return axios({
      method: 'get',
      url: url,
  }).then(response => {
      return response.data
  });
}

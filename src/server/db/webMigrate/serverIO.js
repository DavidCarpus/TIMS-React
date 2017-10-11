var fs = require('fs');
var axios = require("axios");
var Config = require('../../config'),
configuration = new Config();
// var wget = require('node-wget');
// var wget = require('./wget');
// var wget = require('node-wget-promise');

const mkdirp = require('mkdirp-promise')

const privateDir = '../private/'+process.env.REACT_APP_MUNICIPALITY;

// const localFileBaseURL = '/home/dcarpus/code/milton_nh/currentMiltonWebsite/miltonnh-us.com'
const localFileBaseURL = () => '/home/dcarpus/code/currentSites/'+configuration.sourceTownDomain

let serverPath = '/home/carpusco/TestSites/'+ process.env.REACT_APP_MUNICIPALITY + '/private/Attachments/'

const mode = process.env.NODE_ENV||'development'

console.log('serverIO - configuration.mode:', mode);
if (mode === 'development') {
    serverPath = privateDir + '/Attachments/'
} else if  (mode === 'production') {
    // serverPath = '/home/carpusco/miltonnh.us/private/Attachments/'
    serverPath = '/home/carpusco/Prod/'+ process.env.REACT_APP_MUNICIPALITY + '/private/Attachments/'
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
    localFileBaseURL:localFileBaseURL,
    getRedirectLocation:getRedirectLocation,
    getURLCacheLocation:getURLCacheLocation,
    cachedURIExists:cachedURIExists,
    cachingFetchURL:cachingFetchURL,
}

function initSFTP() {    if (sftpPromise==null)     sftpPromise = sftp.connect(connSettings)  }

function getSourceServerHost() {  return configuration.sourceTownDomain }
function getServerFilePath() {    return serverPath }
// let getServerFilePath = () => serverPath
let matchHost = (host, uri) => uri && uri.indexOf(host) !== -1
// let miltonnhusURI = (uri) => matchHost('miltonnh-us', uri)
// let localFileExists = (fullPath) => fs.existsSync(fullPath)
let localFileExists = (fullPath) => {
    try {
        return fs.statSync(fullPath).isFile()
    } catch(e) {
        return false
    }
}
let localFileMissing = (fullPath) => !localFileExists(fullPath)

let hasSourceTownURI = (uri) => matchHost(configuration.sourceTownURI, uri)
const remoteTownURI = (uri)  => matchHost(configuration.sourceTownURI, uri) || matchHost(configuration.sourceTownArchiveDomain, uri)
let isPathToFile = (uri) => uri.match(/.*\.[a-zA-Z]{3,}$/) !== null
let getExtension = (path)=> (path && path.match(/\.[0-9a-z]+$/i, '') && path.match(/\.[0-9a-z]+$/i, '').length > 0) ? path.match(/\.[0-9a-z]+$/i, '')[0] : path

let baseURI = (host, uri) =>  uri.replace(new RegExp('https?://w{0,3}.?' + host + '/?'), '')
let baseURIpath = (host, uri) =>
    uri.replace(new RegExp('https?://' + host + '/?'), '').match(/(.*)\//) ?
    uri.replace(new RegExp('https?://' + host + '/?'), '').match(/(.*)\//)[1]+'/':
    '/'
let localPathFromURI = (localBasePath, host, uri) =>localBasePath + '/' + baseURI(host, uri)


const pipeResponse = (response, dest) => {
    return mkdirp(dest.replace(/\/([^\/]+)$/,''))
    .then(created => {
        if (created) {
            console.log('created:',created);
        }

        return new Promise(function(resolve, reject) {
            console.log('Writing response to', dest);
            let ws = fs.createWriteStream(dest)
            ws.on('finish', () => {
                // console.log('Finished write');
                resolve(dest)
            })
            // ws.on('close', () => {
            //     console.log('Closed write?');
            //     resolve(dest)
            // })
            ws.on('error', (err)=> {
                console.log('writeStream error', err);
                reject(err)
            })
            response.data.pipe(ws)
        });
    })
    .catch(err => console.log(err))

}
function cachedURIExists(uri) {
    // console.log('cachedURIExists?',uri, '\n',getURLCacheLocation(uri));
    return localFileExists(uri) || localFileExists(getURLCacheLocation(uri))
}
//========================================
function pullLocalCopy(remoteURI, localPath) {
    // console.log('pullLocalCopy(remoteURI, localPath)',  '\n  ', remoteURI, '\n  ', localPath);
    console.log('pullLocalCopy\n  ', remoteURI.replace(/.*_archive/, '*archive*')
        );
    return axios({
        method:'get',
        url:remoteURI,
        responseType:'stream'
    })
    .then( (response) => {
        console.log('Got response 1');
        if (response.status === 200) {
            console.log('response.data.responseUrl',response.data.responseUrl);
            return response
        }

        console.log('*** (',response.status,') pullLocalCopies: remoteURI', remoteURI, localPath);

        let responseUrl =response.data.responseUrl.replace(/\/?$/,'')
        remoteURI = remoteURI.replace(/\/?$/,'')
        let responseFilename=responseUrl.replace(/.*\//,'').trim()
        let extension=getExtension(responseFilename).trim()
        console.log('\nresponse', response.headers['content-type'], '  fn:',responseFilename, '  xtn:',extension);
        if(responseUrl !== remoteURI){
            remoteURI = responseUrl
            if (!localFileMissing(localPath) ) {
                console.log('localFile NOT Missing 2:', localPath);
                // console.log('localFile NOT Missing 2:', dest);
                return Promise.resolve(localPath)
            }

            return axios({
                method:'get',
                url: responseUrl,
                responseType:'stream'
            })
        } else {
            return response
        }
    })
    .then(function(finalResponse) {
        responseUrl =finalResponse.data.responseUrl.replace(/\/?$/,'')
        let responseFilename=responseUrl.replace(/.*\//,'').trim()
        let extension=getExtension(responseFilename).trim()
        console.log('finalResponse', finalResponse.headers['content-type'], '  fn:',responseFilename, '  xtn:',extension);
// localPath
        if(finalResponse.headers['content-type'].startsWith( 'text/html') ){ //&& responseFilename === extension  ){
            console.log('***Add index.html to localPath ', localPath);
            localPath = localPath + '/__index.html'
        }
        if(finalResponse.headers['content-type'].startsWith( 'application/pdf')){
            console.log('***Add pdf extension to localPath ', localPath);
            localPath = localPath + '.pdf'
        }
        if (!localFileMissing(localPath) ) {
            console.log('localFile NOT Missing 3:', localPath);
            return Promise.resolve(localPath)
        }
        return pipeResponse(finalResponse, localPath )
        .then(writtenPath => {
            console.log('Wrote', writtenPath);
            return writtenPath
        })
    })
    .catch(err => {
        // console.error("Error pulling ",remoteURI, err);
        console.error("Error pulling ",remoteURI);
        return null;
    })
}

//========================================
function pullLocalCopies(records) {
    // let missingFiles = records.filter(rec => hasSourceTownURI(rec.uri))
    let missingFiles = records.filter(rec => remoteTownURI(rec.uri))
    // console.log('pullLocalCopies', records.length, records, missingFiles, getSourceServerHost());

    return Promise.all(
        missingFiles.map(rec => {
            const uriHost = matchHost(configuration.sourceTownURI, rec.uri) ? configuration.sourceTownURI : configuration.sourceTownArchiveDomain
            let dest =localPathFromURI(localFileBaseURL(), uriHost, rec.uri).trim()
            if (!localFileMissing(dest) ) {
                return Promise.resolve(Object.assign(rec, {local:dest}))
            } else if (!localFileMissing(dest + '.pdf') ) {
                return Promise.resolve(Object.assign(rec, {local: dest + '.pdf'}))
            } else if (!localFileMissing(dest + '/__index.html') ) {
                return Promise.resolve(Object.assign(rec, {local: dest + '/__index.html'}))
            } else {
                return pullLocalCopy(rec.uri, dest)
                .then(writtenPath => {
                    return Promise.resolve(Object.assign(rec, {local:writtenPath, pulled: writtenPath}))
                })
            }
        })
    )
    .then(done => {
        // console.log('pulledLocalCopies', done.length, done);
        return done
    } )
}
//========================================
function getRedirectLocation(record) {
    if (!hasSourceTownURI(record.uri)) { return Promise.resolve( Object.assign(record, {redirectType: 'external'} ) ) } // URI already remote

    return axios({
        method:'get',
        url:record.uri,
        // responseType:'stream'
    })
    .then( (response) => {
        record.uri = response.request.res.responseUrl
        record.redirectType =  hasSourceTownURI(record.uri) ? 'internal': 'external'
        return record
    })
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
                        // console.log('Read pathToDir', baseServerPath + pathToDir);
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
            // if (configuration.mode !== 'development') {
            //     console.log('Push ', fullPathLocalFile , 'to', serverDest);
            // }
            console.log('pushFileToServer ', fullPathLocalFile , 'to', serverDest);
            return sftp.put(fullPathLocalFile, serverDest, true ) ///Param 3=useCompression
        })
        .then( (data) => {
            // console.log('Uploaded:', serverDest.replace(/.*\//, ''));
            return Promise.resolve(serverDest)
        })
        .catch(err => {
            console.log("sftpPromise:put err", fullPathLocalFile, serverDest);
            // reject("sftpPromise:err", err);
            Promise.resolve("**sftpPromise:put err", serverDest);
        })
    } else {
        return new Promise(function(resolve, reject) {
            // console.log('Copy file to "Server" location .. ', fullPathLocalFile, 'as', serverDest);
            if (!serverDest || serverDest.length === 0 || !fullPathLocalFile || fullPathLocalFile.length === 0) {
                // console.log('**** Invalid "Server" location .. ', serverDest);
                reject('**** Invalid "Server" paths .. ' + fullPathLocalFile + ' -- ' + serverDest)
            }
            var rd = fs.createReadStream(fullPathLocalFile);
            rd.on("error", function(err) { reject(err); });
            var wr = fs.createWriteStream(serverDest);
            wr.on("error", function(err) { reject(err); });
            wr.on("close", function(ex) { resolve(serverDest); });
            rd.pipe(wr);
            fs.createReadStream(fullPathLocalFile).pipe(fs.createWriteStream(serverDest));
        })
    } // else
}
//========================================
function fetchFileURL(url) {
    // console.log('fetchFileURL', url);
    return new Promise(function(resolve, reject) {
        fs.readFile(url, 'utf8', function(err, data) {
            if (err) reject(err);
            // console.log('OK: ' + url);
            const contentType = url.endsWith('html') ? 'text/html': 'application/pdf'
            // resolve(data)
            resolve({data: data, contentType:contentType, location:url})
        })
    })
}
//========================================
function fetchURL(url) {
    if (url.indexOf('http') === -1) {
        return fetchFileURL(url);
    }
    return axios({
      method: 'get',
      url: url,
  }).then(response => {
      console.log('response');
      console.log(Object.keys(response.headers));
      console.log(response.headers['content-type']);
      return {data: response.data, contentType:response.headers['content-type'], location:url}
  });
}
//========================================
//========================================
function writeFileWithPathCreate(fullFilePath, data) {
    // console.log('writeFileWithPathCreate', fullFilePath);
    return mkdirp(fullFilePath.replace(/\/([^\/]+)$/,''))
    .then(mkdir => {
        console.log('mkdirp', mkdir);
        return new Promise(function(resolve, reject) {
            fs.writeFile(fullFilePath, data, (err)=>{
                if (err) {
                    reject(err)
                }
                resolve(data)
            })
        })
    })
}
//========================================
function getURLCacheLocation(uri) {
    // let isPathToHTMLFile = (uri) => uri.match(/.*\.html$/) !== null
    // let isPathToPDFFile = (uri) => uri.match(/.*\.pdf$/) !== null

    const isArchiveDomain = (uri) => matchHost(configuration.sourceTownArchiveDomain, uri)
    const uriHost =isArchiveDomain(uri) ? configuration.sourceTownArchiveDomain: configuration.sourceTownURI
    const cacheURI =localPathFromURI(localFileBaseURL() + (isArchiveDomain(uri)? "/__archive": ''), uriHost, uri)
    // console.log('getURLCacheLocation:cachURI','\n  ', uri, '\n  ', cacheURI);
    return cacheURI.trim()
    // return (isPathToHTMLFile(cachURI) || isPathToPDFFile(cachURI))? cachURI: cachURI+'/__index.html'
}
//========================================
function cachingFetchURL(uri) {
    let cacheURILocation = getURLCacheLocation(uri)
    let activeURI = uri
    if (cachedURIExists(uri)) {
         activeURI = cacheURILocation
    }
    if (cachedURIExists(uri+'.pdf')) {
         activeURI = cacheURILocation+'.pdf'
    }
    if (cachedURIExists(uri+'/__index.html')) {
         activeURI = cacheURILocation+'/__index.html'
    }
    // const activeURI = (cachedURIExists(uri)) ? cacheURILocation: uri
    // console.log('\n***cachingFetchURL', '\n  -',activeURI,  '\n  -',cacheURILocation, '\n  -', uri,'\n');
    // if (activeURI !== uri) {
    //     return pullLocalCopy(uri, cacheURILocation)
    // }

    if (!cachedURIExists(activeURI)) {
        // console.log('**++ pulling ', activeURI);
        return pullLocalCopy(uri, cacheURILocation)
        .then(writtenPath => {
            if (writtenPath === null) { //Server error or 404
                return Promise.resolve({data: null, contentType:'error', location:uri})
            }
            return fetchURL(writtenPath)
            .then(urlData =>{
                // console.log('fetchURL(pulledFile)', pulledFile);
                return Promise.resolve(urlData)
            })
        })
    } else {
        // console.log('**++ cachedURIExists', activeURI);
        return fetchURL(activeURI)
        .then(urlData =>{
            const wholePage = urlData.data
            // console.log('wholePage',wholePage);
            return Promise.resolve(urlData)
        })
    }
}
//========================================

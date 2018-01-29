var fs = require('fs');
var axios = require("axios");
var Config = require('./config'),
configuration = new Config();
// var mmm = require('mmmagic'),
//     Magic = mmm.Magic;

let getMimeType = (uri)=> {
    const ext=getExtension(uri)
    switch (ext) {
        case '.ics':
            return Promise.resolve("text/calendar")
            break;
        default:
        console.log('getMimeType:uri',ext, uri);
        throw new Error('mimeType routine not "Set"')
    }
}
let setMimeTypeRoutine = (routine) => {getMimeType = routine}
//========================================
const mkdirp = require('mkdirp-promise')

// const privateDir = '../../private/'+process.env.REACT_APP_MUNICIPALITY;
const privateDir = configuration.PRIVATE_DIR

// const localFileBaseURL = '/home/dcarpus/code/milton_nh/currentMiltonWebsite/miltonnh-us.com'
const localFileBaseURL = () => '/home/dcarpus/code/currentSites/'+configuration.sourceTownDomain

let serverPath = '/home/carpusco/TestSites/'+ process.env.REACT_APP_MUNICIPALITY + '/private/Attachments/'

const mode = process.env.NODE_ENV||'development'

// console.log('serverIO - configuration.mode:', mode);
if (mode === 'development') {
    serverPath = privateDir + '/Attachments/'
} else if  (mode === 'production') {
    // serverPath = '/home/carpusco/miltonnh.us/private/Attachments/'
    serverPath = '/home/carpusco/Prod/'+ process.env.REACT_APP_MUNICIPALITY + '/private/Attachments/'
}

let Client = require('ssh2-sftp-client');
let sftp = new Client();
var connSettings = {}
// let privateKey= (mode === 'development')? require('fs').readFileSync('/home/dcarpus/.ssh/id_rsa'):"";
let privateKey= "";

let readSSH_PK = (pk)=> {
    console.log('readSSH_PK:',pk);  privateKey=pk
    privateKey= require('fs').readFileSync('/home/dcarpus/.ssh/id_rsa');
    connSettings = {
        // host: 'carpusco.wwwss29.a2hosted.com',
        host: 'carpusco.wwwss56.a2hosted.com',
        port: '7822',
        username: 'carpusco',
        privateKey: privateKey
    };
}

let sftpPromise=null

const contentTypeExtensions = [
   {cType: 'application/pdf', ext:'.pdf'},
   {cType: 'application/vnd.openxmlformats-officedocument.wordprocessing', ext:'.docx'},
   {cType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext:'.docx'},
   {cType: 'application/msword', ext:'.doc'},
   {cType: 'image/png', ext:'.png'},
   {cType: 'application/octet-stream', ext:'.zip'},
   {cType: 'text/html', ext:'.html'},
   {cType: 'text/rtf', ext:'.rtf'},
]
const extensionToContentType = (ext) => contentTypeExtensions.filter(rec=>rec.ext === ext)[0].cType

function initSFTP() {    if (sftpPromise==null)     sftpPromise = sftp.connect(connSettings)  }

function extFromContentType(mimeType) {
    const rec = contentTypeExtensions.filter(option=> option.cType === mimeType)
    if (rec.length < 1)  throw new Error('Unknown mimeType:' + mimeType)

    return rec[0].ext
}

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
let getExtension = (path)=> (path &&
    path.match(/\.[0-9a-z]+$/i, '') && path.match(/\.[0-9a-z]+$/i, '').length > 0) ?
    path.match(/\.[0-9a-z]+$/i, '')[0] : ''
const pathWithoutFilename = (path) => path.substr(0, path.lastIndexOf('/'))
const filenameFromPath = (path) => (path && path.lastIndexOf('/') !== path.length) ? path.substr(path.lastIndexOf('/')): ''
const isFileURI = (uri) => uri && (uri.startsWith('file://') || uri.startsWith('/'))
const fileURIPath = (uri) => uri.replace('file://', '')
const wgetRoot = '/home/dcarpus/code/currentSites/'+ configuration.sourceTownDomain


let baseURI = (host, uri) =>{
    if(uri.startsWith('http')) return uri.replace(new RegExp('https?://w{0,3}.?' + host + '/?'), '')
    if(isFileURI(uri)) return fileURIPath(uri).replace(new RegExp(wgetRoot+ '/?'), '')
    // file:///home/dcarpus/code/currentSites/www.newdurhamnh.us
}

let baseURIpath = (host, uri) =>
    uri.replace(new RegExp('https?://' + host + '/?'), '').match(/(.*)\//) ?
    uri.replace(new RegExp('https?://' + host + '/?'), '').match(/(.*)\//)[1]+'/':
    '/'


let localPathFromURI = (localBasePath, host, uri) => {
    // console.log('localPathFromURI', localBasePath, baseURI(host, uri));
    // return uri.startsWith('file://') ? uri.replace('file://',''):
    return localBasePath + '/' + baseURI(host, uri)
}

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
                resolve(dest)
            })
            ws.on('error', (err)=> {
                console.log('writeStream error', err);
                reject(err)
            })
            response.data.pipe(ws)
        });
    })
    .catch(err => console.log(err))

}
function localFileCopy(src, dest) {
    return new Promise(function(resolve, reject) {
        var rd = fs.createReadStream(src);
        rd.on("error", function(err) { reject(err); });
        var wr = fs.createWriteStream(dest);
        wr.on("error", function(err) { reject(err); });
        wr.on("close", function(ex) { resolve(dest); });
        rd.pipe(wr);
    // fs.createReadStream(src).pipe(fs.createWriteStream(dest));
    })

}
function cachedURIExists(uri) {
    if(isFileURI(uri)) return localFileExists(fileURIPath(uri))
    // console.log('**cachedURIExists?',uri, '\n')
    // console.log(getURLCacheLocation(uri));

    return localFileExists(uri) || localFileExists(getURLCacheLocation(uri))
}
//========================================
function pullLocalCopy(remoteURI, localPath) {
    // console.log('pullLocalCopy(remoteURI, localPath)',  '\n  ', remoteURI, '\n  ', localPath);
    // console.log('pullLocalCopy\n  ', remoteURI.replace(/.*_archive/, '*archive*') );
    if(isFileURI(remoteURI)){
        const src = remoteURI.replace('file://', '')
        const dest = localPath
        if(!localFileExists(dest)) return localFileCopy(src, dest)
        else return Promise.resolve(dest)
    }
    return axios({
        method:'get',
        url:remoteURI,
        responseType:'stream'
    })
    .then( (response) => {
        // console.log('Got response 1');
        if (response.status === 200) {
            // console.log('response.data.responseUrl',response.data.responseUrl);
            return response
        }

        console.log('*** (',response.status,') pullLocalCopy: remoteURI', remoteURI, localPath);

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
        const contentType = finalResponse.headers['content-type']
        // console.log('finalResponse', finalResponse.headers['content-type'], '  fn:',responseFilename, '  xtn:',extension);

        if(contentType.startsWith( 'text/html') ){
            // console.log('***Add index.html to localPath ', localPath);
            localPath = localPath + '/__index.html'
        } else {
            // const match =  [
            //     {cType: 'application/pdf', ext:'.pdf'},
            //     {cType: 'application/vnd.openxmlformats-officedocument.wordprocessing', ext:'.docx'},
            //     {cType: 'application/msword', ext:'.doc'},
            // ]
            const match = contentTypeExtensions
            .filter(option=> option.cType === contentType)
            if (match.length === 1) {
                // console.log('pullLocalCopy:contentType', contentType);
                if (! localPath.endsWith(match[0].ext)) {
                    console.log('***Add extension to localPath ', match[0].ext, localPath);
                    localPath = localPath + match[0].ext
                }
            } else {
                console.error('pullLocalCopy - UNK response', contentType,
                '\n  fn:',responseFilename, '\n  xtn:',extension , '\n  remoteURI:',remoteURI);
            }
        }

        if (!localFileMissing(localPath) ) {
            // console.log('localFile NOT Missing 3:', localPath);
            return Promise.resolve(localPath)
        }
        return pipeResponse(finalResponse, localPath )
        .then(writtenPath => {
            console.log('Wrote', writtenPath);
            return writtenPath
        })
    })
    .catch(err => {
        throw("Error pulling " + remoteURI + 'err:',err);
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
            if (!localFileMissing(dest)  && getExtension(filenameFromPath(dest)).length > 0) {
                // console.log('*11 *pullLocalCopies 1:',rec.uri, dest);
                return Promise.resolve(Object.assign(rec, {local:dest}))
            } else if (!localFileMissing(dest + '.pdf') ) {
                // console.log('* 22 *pullLocalCopies 2:',rec.uri, dest);
                return Promise.resolve(Object.assign(rec, {local: dest + '.pdf'}))
            } else if (!localFileMissing(dest + '/__index.html') ) {
                // console.log('* 33 *pullLocalCopies 3:',rec.uri, dest);
                return Promise.resolve(Object.assign(rec, {local: dest + '/__index.html'}))
            } else if (!localFileMissing(dest) && getExtension(filenameFromPath(dest)).length === 0 ) {
                // TODO: If dest exists and destination does not have an extension,
                // Determine fileMimeType, copy dest to 'new' dest with added extension
                return getMimeType(dest)
                .then(cType=>{
                    const ext = extFromContentType(cType)
                    const newDest = dest + ext
                    // console.log('cType',cType, newDest);
                    return pullLocalCopy(rec.uri, newDest)
                    .then(writtenPath => {
                        // console.log('pulled',writtenPath);
                        return Promise.resolve(Object.assign(rec, {local:writtenPath, pulled: writtenPath}))
                    })
                })
                .catch(err=> {
                    console.error('Err pulling local Copy missing extension in pullLocalCopies'+ err);
                    return rec
                })
            } else {
                console.log('*****pullLocalCopies:\n',rec.uri, '\n', dest);
                return pullLocalCopy(rec.uri, dest)
                .then(writtenPath => {
                    return Promise.resolve(Object.assign(rec, {local:writtenPath, pulled: writtenPath}))
                })
                .catch(err=> {
                    console.error('Err pulling local Copy in pullLocalCopies'+ err);
                    return rec
                })
            }
        })
    )
    .then(done => {
        // console.log('pulledLocalCopies', done.length);
        return done
    } )
    .catch(err => {
        console.error('Err pulling processing missing files array'+ err);
        return records
    })
}
//========================================
function getRedirectLocation(record) {
    let uri=record.uri
    if (!hasSourceTownURI(uri)) { return Promise.resolve( Object.assign(record, {redirectType: 'external'} ) ) } // URI already remote

    uri = uri.replace(/\/links\/..\//, '/').replace(/\/node\/\.\./, '').replace(/\/planning\/\.\./, '')

    return axios({
        method:'get',
        url:uri,
    })
    .then( (response) => {
        record.uri = response.request.res.responseUrl
        record.redirectType =  hasSourceTownURI(uri) ? 'internal': 'external'
        return record
    })
    .catch(err => {
        if(err.response && typeof err.response === 'Object'){
            console.log('getRedirectLocation:err', uri, err.response, Object.keys(err.response)); //err.Error
        }else {
            console.log('getRedirectLocation:err', uri, {config:err.config, code:err.code}); //err.Error
        }
        record.redirectType = 'ERROR'
        return record
    })
}
//========================================
function makeServerDirs(baseServerPath, pathsToDir) {
    // console.log('makeServerDirs', baseServerPath, pathsToDir);
    if (configuration.mode !== 'development') {
        initSFTP()
        return Promise.all(
            pathsToDir.map( pathToDir => {
               let fullPath = baseServerPath + pathToDir
               if (!fullPath.endsWith('/')) {
                   fullPath = fullPath + '/'
               }
               return sftpPromise.then(() => {
                //    console.log('mkdir', fullPath);
                   return sftp.mkdir(fullPath, true)
                   .then(mkdirSuccess => {
                    //    console.log('mkdirSuccess', mkdirSuccess);
                       return fullPath
                   })
                   .catch(err => {
                       console.log('mkdir Error', fullPath);
                   })
                //    mkdir(remoteFilePath, recursive);
                })
            })
        )
    } else {
        return Promise.all(
            pathsToDir.map( pathToDir => {
               let fullPath = baseServerPath + pathToDir
               if (!fullPath.endsWith('/')) {
                   fullPath = fullPath + '/'
               }
            //    console.log('mkdir', fullPath);
            //    return Promise.resolve([fullPath])
               return mkdirp(fullPath.replace(/\/([^\/]+)$/,''))
            })
        )
    }
    // return Promise.resolve(['TBD'])
}
//========================================
function pullNewServerDirs(baseServerPath, pathsToDir) {
    let serverDirs = {}
    // Pull directories from a server using SFTP
    if (configuration.mode !== 'development') {
        // console.log('pullNewServerDirs (non-dev)', baseServerPath, pathsToDir);
        initSFTP()
        return Promise.all(
             pathsToDir.map( pathToDir => {
                let fullPath = baseServerPath + pathToDir
                // console.log('ls',fullPath);
                return sftpPromise.then(() => {
                    return sftp.list(fullPath);
                })
                .then((data) => {
                    // console.log('data:', data);
                    serverDirs[pathToDir]  =data
                    return data.map(rec=> pathToDir+'/' +rec.name)
                })
                .catch((err) => {
                    console.log('**sftp list err:', fullPath , err);
                    return []
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
                // console.log('pullNewServerDirs: ',baseServerPath + pathToDir);
                fs.readdir(baseServerPath + pathToDir, function(err, items) {
                    if(err)  reject('Missing path ' + baseServerPath + pathToDir)
                    else {
                        // console.log('Read pathToDir', items.length, baseServerPath + pathToDir);
                        resolve (items.map(item => pathToDir+'/' + item) )
                    }
                });
            })
        }))
        .then(allPathItems => {
            // console.log('allPathItems',allPathItems);
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
            console.log('Copy file to "Server" location .. ', fullPathLocalFile, 'as', serverDest);
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
    const urlToFetch = url.replace('file://', '')
    // console.log('fetchFileURL', urlToFetch);
    return new Promise(function(resolve, reject) {
        fs.readFile(urlToFetch, 'utf8', function(err, data) {
            if (err) reject(err);
            resolve(data)
        })
    })
    .then(readData => {
        const match = contentTypeExtensions.filter(rec => urlToFetch.endsWith(rec.ext))
        if (match.length >= 1) {
            return Promise.resolve({data: readData, contentType:match[0].cType, location:urlToFetch})
        } else {
            return getMimeType(urlToFetch)
            .then(cType=> (
                {data: readData, contentType:cType, location:urlToFetch}
            ))
        }
    })
}
//========================================
function fetchURL(url) {
    // if(url === null) return Promise.reject({data: "", contentType:"", location:url})
    if(url === null) return Promise.reject("Bad link")

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
    if (uri.startsWith('file:')) {  return uri.trim()  }

    const isArchiveDomain = (uri) => matchHost(configuration.sourceTownArchiveDomain, uri)
    const uriHost =isArchiveDomain(uri) ? configuration.sourceTownArchiveDomain: configuration.sourceTownURI
    const cacheURI =localPathFromURI(localFileBaseURL() + (isArchiveDomain(uri)? "/__archive": ''), uriHost, uri)
    const baseSrcURI = 'http://'+configuration.sourceTownDomain
    uri = uri.replace(baseSrcURI, '').trim()
    // console.log('getURLCacheLocation:cachURI','\n  ',
    //     'uri', uri, '\n  ',
    //     'localFileBaseURL', localFileBaseURL() , '\n  ',
    //     (isArchiveDomain(uri)? "/__archive": ''),
    //     uriHost, '\n  ',
    //     cacheURI
    // );
    // console.log('**getURLCacheLocation:cachURI','\n  ', uri, '\n  ', cacheURI, baseSrcURI);
    return cacheURI.trim()
    // return (isPathToHTMLFile(cachURI) || isPathToPDFFile(cachURI))? cachURI: cachURI+'/__index.html'
}
//========================================
function translateURI(uri) {
    let cacheURILocation = getURLCacheLocation(uri)
    // console.log('**cachingFetchURL', '\n', uri, '\n',cacheURILocation);

    let chkuri = cacheURILocation
    if (isFileURI(chkuri)) chkuri = chkuri.replace(/%20/g, ' ').replace(/%3F/g, '?')

    if (cachedURIExists(chkuri)) { return chkuri }

    const validPostfix = ['.pdf','.doc', '.docx', '__index.html', 'index.html', '/__index.html', '.html']
    const activeURI = validPostfix.reduce( (acc, ext) => {
        if (!acc ){
            if( cachedURIExists(chkuri+ext)) {
                acc= chkuri+ext
            }
        }
        return acc
    }, null)
    if (activeURI === null) {
        debugger
    }
    // console.log('cacheURILocation', activeURI);
    return activeURI
}
//========================================
function cachingFetchURL(uri, forcePull=false) {
    let activeURI =translateURI(uri)
    let cacheURILocation = getURLCacheLocation(uri)
    // console.log('cachingFetchURL',uri, activeURI);
    // if(activeURI === null) throw new Error('NULL URI:' + uri)

    if (activeURI && (!cachedURIExists(activeURI) || forcePull)) {
        console.log('++ pulling ', cachedURIExists(activeURI), activeURI);
        return pullLocalCopy(uri, cacheURILocation)
        .then(writtenPath => {
            if (writtenPath === null) { //Server error or 404
                return Promise.resolve({data: null, contentType:'error', location:uri})
            }
            return fetchURL(writtenPath)
            .then(urlData =>{
                return Promise.resolve(urlData)
            })
        })
        .catch(err => {
            return Promise.reject('Err pulling cached file:'+ uri + ' (err):' + err)
        })
    } else {
        // console.log('++ cachedURIExists', activeURI);
        return fetchURL(activeURI)
        .then(urlData =>{
            // const result = {...urlData,  contentType:urlData.contentType || mimeType(activeURI)}
            // console.log('result', Object.keys(urlData));
            return Promise.resolve(urlData)
        })
    }
}
//========================================
module.exports = {
    pullLocalCopies : pullLocalCopies,
    pullNewServerDirs : pullNewServerDirs,
    pushFileToServer: pushFileToServer,
    pullLocalCopy:pullLocalCopy,
    fetchURL:fetchURL,
    getServerFilePath:getServerFilePath,
    // initSFTP:initSFTP,
    getSourceServerHost:getSourceServerHost,
    localFileBaseURL:localFileBaseURL,
    getRedirectLocation:getRedirectLocation,
    getURLCacheLocation:getURLCacheLocation,
    cachedURIExists:cachedURIExists,
    cachingFetchURL:cachingFetchURL,
    makeServerDirs: makeServerDirs,
    // mimeType:mimeType,
    setMimeTypeRoutine:setMimeTypeRoutine,
    extensionFromContentType: extFromContentType,
    readSSH_PK:readSSH_PK
}
//========================================

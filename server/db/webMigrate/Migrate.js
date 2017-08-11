var fs = require('fs');
var axios = require("axios");
const cheerio = require('cheerio')
var Config = require('../../config'),
configuration = new Config();
// var wget = require('node-wget');
var wget = require('./wget');
var knexConfig = require('../../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

let logErrors = true
// let logErrors = false
console.log(configuration.mode);
const localFileURL = '/home/dcarpus/code/milton_nh/currentMiltonWebsite/miltonnh-us.com'
let serverPath = '/home/carpusco/test.miltonnh.us/server/private/Attachments/'

if (configuration.mode === 'development') {
    // logErrors = true
    serverPath = '/home/dcarpus/code/milton_nh/react_miltonNH/server/private/Attachments/'
} else if  (configuration.mode === 'production') {
    serverPath = '/home/carpusco/miltonnh.us/server/private/Attachments/'
}
// let serverPath = '/home/carpusco/test.miltonnh.us/server/'
let MIN_VALID_YEAR = 2007

// const paths = require('./TablesToScrape.json');

// let Client = require('ssh2');
let Client = require('ssh2-sftp-client');

// let sftpClientConnected = false
let pk=require('fs').readFileSync('/home/dcarpus/.ssh/id_rsa');
let sftp = new Client();
var connSettings = {
    host: 'carpusco.wwwss29.a2hosted.com',
    port: '7822',
    username: 'carpusco',
    privateKey: pk
};
// let sftpPromise = sftp.connect(connSettings)
let serverDirs={}

//========================================
let validRecordType = (recordtype) => ["Agenda", "Minutes", "Video"].includes(recordtype)
//========================================
function translateRecordType(recordtype) {
    let translated = [
        {orig:'AGENDA', valid:'Agenda'},
        {orig:'MINUTES', valid:'Minutes'},
        {orig:'Mnutes', valid:'Minutes'},
        {orig:'Mintues', valid:'Minutes'},
        {orig:'MInutes', valid:'Minutes'},
        {orig:'VIDEO', valid:'Video'},
        {orig:'video', valid:'Video'},
    ].filter(opt => opt.orig===recordtype)
    if (translated && translated.length > 0 && typeof translated !== 'undefined') {
        return translated[0].valid
    // } else {
    //     console.log('Unable to translate document:' , recordtype);
    }
    // if (typeof recordtype === 'undefined') { return ''}
    return recordtype
}
//========================================

//========================================
function newFilenameFromRecord(rec) {
    let oldKey = ''
    let parseOldFN = rec.uri.replace(/.*\//, '').match(/.*_(\d*)_.*/)
    if (parseOldFN && parseOldFN.length > 1) {
        oldKey = parseOldFN[1]
    }
     let extension = rec.uri.match(/\.[0-9a-z]+$/i, '')[0]
    return  rec.groupName + '_' + getY_M_D(rec.date) + '_' + rec.label.replace(' ', '') +'_'+oldKey + extension
}
//========================================
let onlyUnique = (value, index, self) => self.indexOf(value) === index;
let getY_M_D = (date) =>  date.getUTCFullYear() + "_" + (date.getUTCMonth()<9?'0':'') + (date.getUTCMonth()+1) +  "_" + (date.getUTCDate()<10?'0':'') + (date.getUTCDate());
let getRecordYear = (rec) => rec.date.getUTCFullYear()

let conLogIfField = (obj, fieldName,lbl='rec') => obj[fieldName] && console.log(lbl+'.'+fieldName+':', obj);

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
    // .filter( (rec, index) => index<10 )

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
                            resolve(dest)
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
}
//========================================
function pullNewServerDirs(baseServerPath, pathsToDir) {
    let serverDirs = {}
    // Pull directories from a server using SFTP
    if (configuration.mode !== 'development') {
        return Promise.all(
             pathsToDir.map( pathToDir => {
                let fullPath = baseServerPath + pathToDir
                return sftpPromise.then(() => {
                    return sftp.list(fullPath);
                })
                .then((data) => {
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
                    resolve (items.map(item => pathToDir+'/' + item) )
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
            console.log('Uploaded:', serverDest.replace(/.*\//, ''));
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
//========================================
function extractTableRows(originalHTML, groupName) {
    let data = originalHTML;
    data = data.replace(/<\/tr>.*/g, '')
    let anchorRegEx = /<a .*?\"(\S*?)\".*?>(.*?)</;

    return data.split('<tr>').map(row => {
        let cells = row.split('\n')
        .map(cell => cell.trim())
        .filter( r => r.startsWith('<td')) // Ignore items that are NOT wrapped in a TD
        .filter( r => r !== '<td>&#xA0;</td>')
        .map(tagCell => tagCell
            .replace(/<\/?td.*?>/g, '')
            .replace(/<\/?tbody>/g, '')  //Strip out TD and tbody tags
            .replace(/&#xA0;/g, '')
        ).map(cellToReformat => {
            cellToReformat = cellToReformat.replace(/<\/?span.*?>/g, '')
            cellToReformat = cellToReformat.replace(/<\/?strong.*?>/g, '')

            if (cellToReformat.startsWith('<a')) {
                var match = anchorRegEx.exec(cellToReformat);
                return  { label: match[2].trim(), uri: match[1]}
            } else { // SHOULD be the first cell and a date
                return {dateStr: cellToReformat, date:new Date(cellToReformat), groupName:groupName}
            }
        })
        if (! cells[0] && cells.length > 0 ) {
            logErrors && console.error( row.replace(/<td>&#xA0;<\/td>/g, '').trim()   )
        }
        return cells
    })
}
//========================================
function dbRecordsFromExtractedRow(rowData) {
    let dateElement = rowData[0]
    if (!dateElement || typeof dateElement === undefined) {
        console.log("Missing date element???", rowData);
        return
    }
    let meetingDate = dateElement.date
    let groupName = dateElement.groupName

    if (isNaN(meetingDate.getTime() )) {
        if (dateElement.dateStr.search(/^<strong>....<\/strong>$/) >= 0 ) {
            return
        }
        logErrors && console.error("Invalid date:", dateElement.dateStr);
        return
    }
    if (meetingDate.getUTCFullYear() > (new Date()).getUTCFullYear()+1 ||
        meetingDate.getUTCFullYear() < MIN_VALID_YEAR ) {
            logErrors && console.error("Invalid date:", dateElement.dateStr);
        return
    }
    // if (! validRecordType()) {
    //     logErrors && console.error("Invalid date:", dateElement.dateStr);
    // }

    return rowData.filter(cell => cell.uri).map(doc => {
        // console.log(dateElement.dateStr + ' document:', doc);
        let uri = doc.uri
        if (! uri.startsWith('http')) {
            // uri = 'http://miltonnh-us.com' + (uri.startsWith('/')?'':'/') + uri
            uri = 'http://miltonnh-us.com' + uri
        }
        let label = doc.label
        if (! validRecordType(label) ) {
            label = translateRecordType(doc.label)
        }

        return {groupName:groupName, date: meetingDate,  label:label, uri:uri}
    })
}
//========================================
function scrapeTableFromURL(pathToChk) {
    return new Promise(function(resolve, reject) {
        const request = axios({
          method: 'get',
          url: pathToChk.url,
        });
        return request.then( response => {
            var $ = cheerio.load(response.data);
            let data = $(pathToChk.query).html();
            let records = parseHTMLData({url:pathToChk.url, data:data, group:pathToChk.group});
            resolve(records)
        })
    })
}
//========================================
//========================================
function enterIntoDB(record) {
    // Check DB for record and add if not there
    return knex('PublicRecords').select('*').where(record)
    .then(results => {
        if (results.length === 0) {
            return knex('PublicRecords').insert(record)
            .then(results => {
                logErrors && console.log("Log to DB:" , record.recordtype, record.pageLink, record.date);
            })
        }
        return null
    })
    .then(results => {
        if (results && results.length > 0) {
            record.id = results[0];
        }
        return Promise.resolve([record]);
    })
    .catch(dberr => {
        console.log("DBError:", dberr);
        return Promise.reject(dberr);
    })
}
//========================================
//========================================
//========================================
if (require.main === module) {
    paths = [
        {"group":"Selectmen", "url":"http://miltonnh-us.com/bos_agendas.php", "query":"table[border='1'][width='95%']"},
    ]

    Promise.all(paths.map(record => {
        console.log(record.group);
        if (configuration.mode !== 'development') {
            sftpPromise = sftp.connect(connSettings)
        }
        return fetchURL(record.url)
        .then(wholePage => {
            var $ = cheerio.load(wholePage);
            return $(record.query).html();
        })
        .then( onlyTable => extractTableRows(onlyTable, record.group) )
        .then(extractedRows => {
            let allRecords=[];
            extractedRows.map((extractedRow, index) => {
                if (extractedRow.length > 0 ) {
                    let dbRecords = dbRecordsFromExtractedRow(extractedRow)
                    Array.prototype.push.apply(allRecords, dbRecords);
                }
            })
            // return allRecords.filter(rec => rec.date.getUTCFullYear() === 2012)
            allRecords.map(rec => {
                if (! validRecordType(rec.label)) {
                    logErrors && console.error("Invalid document type:", getY_M_D(rec.date) , '"'+rec.label+'"');
                }
            })

            return allRecords.filter(rec =>validRecordType(rec.label)  )
        })
        .then( pullLocalCopies )
        .then(pulledLocal => {
            return pulledLocal.map(rec => {
                rec.newFilename = newFilenameFromRecord(rec)
                return rec
            })
        })
        .then(recWithDest => {
            // Fetch directories (by year) from new server
            return pullNewServerDirs(serverPath, recWithDest.map(getRecordYear ).filter(onlyUnique) )
            .then( serverDirs => {
                let allPaths=[];
                serverDirs.map( directory => {
                    directory.map( path => {
                        allPaths.push(path)
                    })
                    return recWithDest
                })
                // console.log('serverDirs:', allPaths.sort( (a,b) => a.localeCompare(b)));
                let notOnServer = (rec) => !allPaths.includes(rec.date.getUTCFullYear() + '/' +rec.newFilename)

                // Check converted records against server directories
                return Promise.all(
                    recWithDest.filter(notOnServer).map(rec => {
                        let dest = serverPath + rec.date.getUTCFullYear() + '/' + rec.newFilename
                        return pushFileToServer(rec.local, dest)
                        .then( (pushReq)=> {
                            return rec
                        }).catch(err => console.log(err))
                    })
                )
                .then( newFilesUploaded => {
                    return recWithDest;
                })
            })
        })
        .then(filesCopied => {
            // Log to database if not already there
            return Promise.all(
                filesCopied.map(rec => {
                    let dest = rec.date.getUTCFullYear() + '/' + rec.newFilename
                    return enterIntoDB({pageLink:rec.groupName, recordtype: rec.label, date:rec.date, fileLink:dest})
                })
            ).then(entered => {
                return entered
            })
        })


    })).then(allGroupsDone => {
            // setTimeout(() => process.exit(), 5000);
            process.exit()
    })
}

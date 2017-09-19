var fs = require('fs');
// var path = require('path');
var jsdom = require("jsdom");
var axios = require("axios");
const cheerio = require('cheerio')

// import {contactTypes , submitData} from "./logging";
var logRecords = require('./util').logRecords;
var logDebugRecords = require('./util').logDebugRecords;
var copyFile = require('./util').copyFile;
var uploadRecords = require('./util').uploadRecords;

const paths = require('./TablesToScrape.json');
const localFileURL = '/home/dcarpus/code/currentMiltonWebsite/miltonnh-us.com'

let outputErrors = false;

const scrapedDataLocation = '../toUpload.json';

// rsync  -auv /home/dcarpus/code/milton_nh/react_miltonNH/server/private/Attachments/ A2:./miltonnh.us/server/private/Attachments
// ssh2-sftp-client

// console.log('process.env.NODE_ENV:', process.env.NODE_ENV || 'development');
var knexConfig = require('../../../server/libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

//========================================
function isValidLinkDesc(group, desc) {
    if(group === 'ChecklistSupervisors' && desc === 'Session')  return true;

    return false;
}
//========================================
function translateAnchorDesc(origDesc, groupName) {
    let translations = [
        {original: 'Agenda', alternatives:['Agenda ---MEETING']},
        {original: 'Amended Agenda', alternatives:['AMENDED Agenda','Agenda Addendum','Agenda Amended','Agenda (Amended)']},
        {original: 'Decision', alternatives:['Decision']},
        {original: 'Minutes', alternatives:['Mnutes','MInutes','Mintues']},
        {original: 'Meeting Notice', alternatives:['Notice','NOTICE']},
        {original: 'Video', alternatives:['video']},
        {original: 'Workshop', alternatives:[]},
    ];

    let results = translations.filter( translation =>  (translation.original === origDesc || translation.alternatives.indexOf(origDesc) >= 0 ) )
    if ( results && results.length > 0) { // found a match
        return results[0].original
    }
    // if (groupName === 'TrustFunds' && (origDesc === 'Notice' || origDesc === 'NOTICE') ) {
    //     return 'Meeting Notice'
    // }
    // console.log('*** groupName/origDesc:', groupName , origDesc);

    return null;
}
//========================================
function parseHTMLData(pathData) {
    let data = pathData.data;
    data = data.replace(/\t/g, '')
    data = data.replace(/<\/?table(.*?)>/g, '')
    data = data.replace(/<\/?tbody>\n/g, '')
    data = data.replace(/&nbsp;/g, '')
    data = data.replace(/&#xA0;/g, '')
    data = data.replace(/<td .*?">/g, '<td>')
    data = data.replace(/<\/td>\n<td>/g, '|')
    data = data.replace(/<td><\/td>/g, '|')
    data = data.replace(/<\/tr>\n<tr>/g, '\n')
    data = data.replace(/<\/?span(.*?)>/g, '')
    data = data.replace(/<\/?strong>/g, '')
    data = data.replace(/<td>Date/g, '<td>')
    data = data.replace(/<td>/g, 'Date:')

    // data = data.replace(/\nDate:20\d\d/g, '')

    data = data.replace(/\t/g, '')

    data = data.replace(/\|\|/g, '|')
    data = data.replace(/\n\n/g, '\n')
    data = data.replace(/\n\n/g, '\n')
    data = data.replace(/\n\n/g, '\n')

    data = data.replace(/<\/?td>/g, '')
    data = data.replace(/<\/?tr>/g, '')

    let rows = data.split('\n');
    // console.log('data:', data);
    let parsedRecords = rows.map( (row, index) => {
        let record={group:pathData.group, dateStr:'', url: pathData.url, links:[]};

        if (row.includes("|")) {
            let fields = row.split('|');
            fields.map(element => {
                element = element.trim();
                // if (element.startsWith('Date:')) {
                //     record.dateStr = element.replace('Date:', '')
                // }
                // if (element.match(/Date:\d{1,2},? .*? \d{4}/) && ! isNaN(new Date(element.replace('Date:', '')).getTime())  ) {
                if (element.startsWith('Date:') && ! isNaN(new Date(element.replace('Date:', '')).getTime())  ) {
                    record.dateStr = element.replace('Date:', '')
                }
                else if (element.startsWith('<a')) {
                    // console.log('links:', element);
                    let links = element.split('</a>').filter(anchor => anchor.length > 0);
                    links.map(anchorStr => {
                        anchorStr = anchorStr.trim();
                        let anchorObj = {
                            desc: anchorStr.replace(/.*>/g, '').trim(),
                            // 'target' may not exist in link? Selectmen 2011-05-16
                            url:  anchorStr.replace(/(.*?)"/, '').replace(/" .*/, '').replace(/">.*/, '')
                        }
                        if (anchorObj.desc === anchorObj.url) {
                                record.status = anchorObj.desc;
                        }  else {
                            record.links = record.links.concat(anchorObj)
                        }
                    })
                } else if (element.length > 0) {
                    switch (element.toUpperCase()) {
                        case 'CANCELED':
                        case 'CANCLED':
                        case 'CANCELLED':
                        case 'MEETING CANCELED':
                            // console.error("Cancel Meeting");
                            record.status = 'Canceled';
                            break;

                        // Ignore these
                        case '2010':
                        break;

                        default:
                            record.errors = record.errors || [];
                            record.errors.push({error:'Unknown item', data:element});

                    }
                }
            })
        }

        if (record.dateStr === '' && row.length > 0 && !row.startsWith('Date:|') && !row.startsWith('Date: |')) {
            record.errors = record.errors || [];
            record.errors.push({error:'Missing Date from row', data:row});
        }
        return record;
    })
    .map(parsedRecord => {
        parsedRecord.links = parsedRecord.links.map(anchor => {
            let newDesc = translateAnchorDesc(anchor.desc, parsedRecord.group);
            anchor.desc = newDesc || anchor.desc

            if (newDesc === null) {
                if (!  isValidLinkDesc(parsedRecord.group, anchor.desc)) {
                    parsedRecord.errors = parsedRecord.errors || [];
                    parsedRecord.errors.push({error:'Unknown document type', data:anchor});
                }
            }
            return anchor;
        })
        return parsedRecord;
    })
    return parsedRecords;
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
            console.log('data:', $(pathToChk.query));
            let records = parseHTMLData({url:pathToChk.url, data:data, group:pathToChk.group});
            resolve(records)
        })
    })
}
//========================================
function translateRecord(origRecord) {
    let newRecord = {pageLink: origRecord.group, links:origRecord.links, date:new Date(origRecord.dateStr)}

     if (isNaN( newRecord.date.getTime())) {newRecord.date = null}

    if (origRecord.errors) {
        newRecord.errors = origRecord.errors;
    }
    if (origRecord.status) {
        newRecord.status = origRecord.status;
    }
    newRecord.links = newRecord.links.map( (link,index) => {
        let translatedLink = {desc:link.desc, url:link.url}
        let path = link.url.trim();
        if (path.includes('http') && !path.includes('miltonnh-us')) {
            // console.log('Matched external URL.');
            return translatedLink
        }

        path = path.replace(/^http:\/\/miltonnh-us.com/g, '');
        if (path.includes('http') && path.includes('miltonnh-us')) {
            console.log('************* ', path);
        }
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        if (fs.existsSync(localFileURL + path)) {
            path = localFileURL + path
        } else  {
            // console.log('Prepending domain http://miltonnh-us.com to ', path);
            path = 'http://miltonnh-us.com' + path;
        }
        translatedLink.path = path;
        let fnParts=[]
        if (newRecord.date) {
            fnParts=[newRecord.pageLink, link.desc, index, newRecord.date.getFullYear(), newRecord.date.getMonth(), newRecord.date.getDate()]
        } else {
            fnParts=[newRecord.pageLink, link.desc, index]
        }
         translatedLink.filename = fnParts.join("_")+ "." + path.replace(/.*\./, '');
         return translatedLink
    })

    return newRecord;
}
//========================================
function scrapeWebURLPaths(webPaths) {
    return Promise.all(webPaths.map(chkPath => {
        let scrapeReq = scrapeTableFromURL(chkPath)
        .then(scrapedRecord => {
            return scrapedRecord;
        })
        return scrapeReq;
    }))
    .then(scrapedRecordsForPath => {
        scrapedRecordsForPath.map(pathRecords => {
            let errors = pathRecords
            .filter(record => { return (typeof record.errors !== 'undefined' || record.date === null)})
            .map(rec => { return translateRecord(rec); })

            outputErrors && logDebugRecords(errors)
        })

        // Only forward on error free records
        return Promise.resolve(scrapedRecordsForPath.map(pathRecords => {
            return pathRecords
            .filter(record => { return (typeof record.errors === 'undefined' && record.links.length>0 )})
            .map(rec => { return translateRecord(rec);})
            .filter(translatedRecord => { return (translatedRecord.date !== null )})
        }))
    })
}
//========================================
function enterIntoDB(record) {
    // TODO: Check DB for record and add if not there
    // let sql = knex('PublicRecords').select('*').where(record).toString();
    // console.log('sql:', sql);
    return Promise.resolve(knex('PublicRecords').select('*').where(record)
    .then(results => {
        if (results.length === 0) {
            // console.log("Insert record.", record);
            return knex('PublicRecords').insert(record)
        }
        return null
    })
    .then(results => {
        if (results && results.length > 0) {
            // console.log('Added meeting Doc:' + require('util').inspect(results, {colors:true, depth: null }));
            record.id = results[0];
            return Promise.resolve([record]);
        } else {
            return Promise.resolve([record]);
        }


    })
    .catch(dberr => {
        console.log("DBError:", dberr);
        return Promise.reject(dberr);
    })

    )
}

//========================================
//========================================
//========================================
if (require.main === module) {
    let paths = [
    // {"group":"TrustFunds", "url":"http://miltonnh-us.com/trust_funds.php", "query":"table[border='1'][width='563']"},
    {"group":"Selectmen", "url":"http://miltonnh-us.com/bos_agendas.php", "query":"table[border='1'][width='95%']"},
    ]

    scrapeWebURLPaths(paths)
    .then(validRecords => {
        Promise.all(validRecords.map(result => {
            return uploadRecords(result)
        }))
        .then( processedGroupsForPath => {
            let processedFiles=[]
            processedGroupsForPath.map(processedGroup => {
                processedGroup.map(group => {
                    group.map(file => {
                        processedFiles.push(file);
                    })
                })
            })
            return processedFiles
            .filter(file => {return (file.status !== 'invalid')} );
        })
        .then(filesToEnterIntoDB => {
            return Promise.all(filesToEnterIntoDB.map(record => {
                // console.log(record.link.path);
                // Promise.resolve(record);
                const fileLink = typeof record.link.path === 'undefined' ? record.link.url : record.link.filename
            return enterIntoDB({pageLink:record.pageLink, date:record.date,
                fileLink:fileLink, recordtype:record.link.desc})
            }))
        })
        .then(enteredData => {
            // enteredData.map(data => {
            //     if (typeof data !== 'undefined' && 'id' in data && data.id>0) {
            //         console.log('enteredData:',data);
            //     }
            // })
            process.exit()
        })

        .catch(err => {console.log('Copy error?', err);})
    })
    .catch(err =>
        console.log('*** Error:', require('util').inspect(err, { depth: null }))
    );

}

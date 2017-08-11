var fs = require('fs');
// var path = require('path');

var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

//========================================
function copyFile(source, target) {
    return new Promise(function(resolve, reject) {
        var rd = fs.createReadStream(source);
        rd.on('error', rejectCleanup);
        var wr = fs.createWriteStream(target);
        wr.on('error', rejectCleanup);
        function rejectCleanup(err) {
            console.log('Copy Error:', err);
            rd.destroy();
            wr.end();
            reject(err);
        }
        wr.on('finish', resolve);
        rd.pipe(wr);
    });
}
//========================================
function uploadRecords(records, overwrite=false) {
    const baseTarget = '/home/dcarpus/code/milton_nh/react_miltonNH/server/private/Attachments/'

    return Promise.all(records.map(record => {
        const date = new Date(record.date);

        return Promise.all( record.links.map(link => {
            let source = link.path
            let target = baseTarget + date.getFullYear() +'/' +  link.filename
            let response = {status:'unk', link: link, pageLink:record.pageLink, date:record.date,}
            response.link.filename = date.getFullYear() +'/' +  link.filename

            if (date.getFullYear() < 2005 || date.getFullYear() > 2018 ) {
                response.status = 'invalid'
                return Promise.resolve(response);
            }

            if (fs.existsSync(source) && (overwrite? true: !fs.existsSync(target) ) ) { //&& !fs.existsSync(target)
                return copyFile(source, target)
                .then(copyResult => {
                    response.status = 'copied'
                    return Promise.resolve(response);
                }).catch(err => {
                    response.status = 'copyError'
                    return Promise.resolve(response);
                })
            } else {
                response.status = 'skip'
                return Promise.resolve(response);
            }
        }))
    }))
}

//===========================================
function logRecords(tableRecords) {
    if (tableRecords.length <= 0) { return}

    let lines = []
    tableRecords.map(record => {
            if (!record.errors) {
                return record.links.map(link => {
                    if (link.path !== link.url) { // We have it local
                        lines.push(JSON.stringify({"pageLink":record.pageLink, "date": record.date, "documentType": link.desc, "path":link.path, "filename":link.filename}))
                    }
                })
            }
    })
    console.log(lines.join(',\n'));
}

//========================================
function logDebugRecords(tableRecords) {
    if (tableRecords.length <= 0) { return}
    let logHeader=true;

    tableRecords.map(record => {
        // if (record.dateStr === '16 October 2013' && record.errors && record.links.length > 0) {
            if (record.errors) {
                if (logHeader) {
                    console.error('===============');
                    console.error(tableRecords[0].pageLink);
                    console.error('===============');
                    logHeader = false;
                }
                let dateStr='';
                if (record.date) {
                    dateStr = record.date.getDate() + ' ' + monthNames[record.date.getMonth()] + ' ' +  record.date.getFullYear();
                }
                console.error(dateStr, require('util').inspect(record.errors, {colors:true, depth: null }));
            } else {log
                console.log(require('util').inspect(record, {colors:true, depth: null }));
            }
    })
}

//===========================================
// export {contactTypes, submitData}
module.exports = {
    logRecords : logRecords,
    logDebugRecords : logDebugRecords,
    copyFile: copyFile,
    uploadRecords:uploadRecords
}

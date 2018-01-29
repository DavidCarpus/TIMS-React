// var Config = require('../server/config'),
// configuration = new Config();

const cheerio = require('cheerio')
var toMarkdown = require('to-markdown');
var marked = require('marked');
const crc = require('crc');

var knexConfig = require('../server/libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);
var getServerFilePath = require('../server/serverIO').getServerFilePath;
var pullNewServerDirs = require('../server/serverIO').pullNewServerDirs;
var pushFileToServer = require('../server/serverIO').pushFileToServer;

// var enterOnlyIntoTable = require('../server/libs/db/common').enterOnlyIntoTable;
var addOrUpdateTable = require('../server/libs/db/common').addOrUpdateTable;
var cachingFetchURL = require('../server/serverIO').cachingFetchURL;

var mimeFileIO = require('./mimeFileIO').getMimeType;
var setMimeTypeRoutine = require('../server/serverIO').setMimeTypeRoutine;
setMimeTypeRoutine(mimeFileIO)
var getMimeType = require('./mimeFileIO').getMimeType;
var extensionFromContentType = require('../server/serverIO').extensionFromContentType;

var readSSH_PK = require('../server/serverIO').readSSH_PK;
readSSH_PK('/home/dcarpus/.ssh/id_rsa')

//=============================================
//=============================================
let mergeArrays = (arrays) => [].concat.apply([], arrays)

const cleanURI = (uri) => { // Merge references to parent directories
    return uri.replace(/\/[\w-]+\/\.\./, '').replace(/\/[\w-]+\/\.\./, '').replace(/\/[\w-]+\/\.\./, '')
}
//=============================================
function addPageTextFromRec(dbConn=knexConnection, rec){
    const sourceUriCRC = crc.crc32(rec.fileLink).toString(16)
    return addOrUpdateTable(dbConn, 'PageText',
        {  pageLink: rec.pageLink,
            sectionName: "Page",
            sourceUriCRC:  sourceUriCRC,
            markdown:rec.pageText,
            html: marked(rec.pageText)},
        {sourceUriCRC: sourceUriCRC}
    )
}
//=============================================
function addPublicRecordsFromRec(dbConn=knexConnection, pageTextID, rec){
    // console.log('addPublicRecordsFromRec',rec);
    // console.log('addPublicRecordsFromRec',rec.fileLink.substr(rec.fileLink.lastIndexOf('/')));
    return addOrUpdateTable(dbConn, 'PublicRecords',
        { pageLink: rec.pageLink,
            date: new Date(),
            recordtype: "Page",
            pageTextID: pageTextID,
            fileLink: rec.fileLink.substr(rec.fileLink.lastIndexOf('/')),
            recorddesc: rec.recorddesc,
        },
        {  pageLink: rec.pageLink,
            recorddesc: rec.recorddesc,
            // recordtype: "HelpfulInformation",
        }
    )
}
//=============================================
function processFileListPage(dbConn=knexConnection, pageLinkData){
    if(pageLinkData.files.length > 1) throw new Error('Unable to process multiple files.')
    console.log('processFileListPage:pageLinkData',pageLinkData);
    //Pull the uri for the file local
    const fileData = pageLinkData.files[0]
    return cachingFetchURL(fileData.uri)
    .then(fetchedData =>{
        return pullNewServerDirs(getServerFilePath(), ['Documents'] )
        .then( serverDirs =>{
            const sourceUriCRC = crc.crc32(fileData.uri).toString(16)
            const src = fetchedData.location
            const dest = 'Documents/' + sourceUriCRC + '_' + fileData.label
            // console.log('xfer',{src:src, dest:dest, fileLink:dest} );
            let allPaths= mergeArrays(serverDirs)
            const notOnServer = (rec) => !allPaths.includes(rec.fileLink)
            const newData = {
                oldFileLink:pageLinkData.fileLink,
                newFileLink:dest,
                id:pageLinkData.id,
                sourceUriCRC: sourceUriCRC,
            }
            if(notOnServer(dest)){
                // console.log('Push ', fetchedData.location, '\n\tto:' , dest);
                return pushFileToServer(fetchedData.location, getServerFilePath()+dest, true)
                .then(pushedFile => {
                    return Promise.resolve(newData)
                })
            }
            else {
                return Promise.resolve(newData)
            }
        })
        .then( (newRec)=> {
            //Update the HelpfulLinks record with new location (filelink uri with id)
            // console.log('newRec',newRec);
            return addOrUpdateTable(dbConn, 'PublicRecords', {fileLink: newRec.newFileLink}, {id:newRec.id} )
            .then( () =>  Promise.resolve("Processed Filelink page:", fileData.uri))
        })
    })

    //
}
//=============================================
function processSimplePage(dbConn=knexConnection, pageLinkData) {
    // return Promise.resolve(pageLinkData.type)
    return addPageTextFromRec(dbConn, pageLinkData)
    .then(pageTextRec => {
        return addPublicRecordsFromRec(dbConn,pageTextRec[0].id, pageLinkData)
    })
    .then( () => Promise.resolve('Processed no link page: ' + pageLinkData.fileLink))
}
//=============================================
function replaceFileLinks(pageText, linkRecords) {
    // console.log('replaceFileLinks(pageText, linkRecords)', pageText, linkRecords );
    const newPageText = linkRecords.reduce( (acc, link )=>{
        return acc.replace('('+link.href+')', '(fetchfile/' + link.id + ')')
    }, pageText.markdown)
    // console.log('origPageText',pageText.markdown);
    // console.log('newPageText',newPageText);
    return newPageText
}
//=============================================
function transferFileAttachmentsForRec(dbConn=knexConnection, parentId, rec){
    // console.log('transferFileAttachmentsForRec',rec);
    // pushFileToServer( fullPathLocalFile, serverDest )
    const serverDir = getServerFilePath()+'/PageAttachments/'
    // console.log('serverDir',serverDir);
    return Promise.all(rec.links.map(link=>
        cachingFetchURL(link.uri)
        .then(fetchedData =>{
            const sourceUriCRC= crc.crc32(link.uri).toString(16)
            const fileLink ='PageAttachments/' + sourceUriCRC + extensionFromContentType(fetchedData.contentType)
            return { src: fetchedData.location,
                dest : getServerFilePath()+fileLink,
                fileLink: fileLink,
                recorddesc:link.label,
                href:link.href,
                sourceUriCRC:sourceUriCRC
            }
        })
        .catch(err=> {
            console.log('Err processing', {sourcePage:rec.fileLink, href:link.href, label:link.label}, err);
        })
    ))
    .then(xlate => {
        // console.log('xlate',xlate);
        return pullNewServerDirs(getServerFilePath(), ['PageAttachments'] )
        .then( serverDirs =>{
            let allPaths= mergeArrays(serverDirs)
            // console.log('allPaths', allPaths);
            const notOnServer = (rec) => !allPaths.includes(rec.fileLink)
            const validRecord  = (rec) => typeof rec !== 'undefined'
            return Promise.all(xlate.filter(validRecord).filter(notOnServer).map(rec=> {
                return pushFileToServer(rec.src, rec.dest, true)
                .then(pushedFile => {
                    //Intentional side effect for records that were uploaded. Allows filtering later.
                    rec.pushed=true
                    return rec
                })
            }) )//notOnServer
            .then((pushed)=> {
                // console.log('xlate', xlate.filter(rec=>!rec.pushed));
                return Promise.all(xlate.filter(validRecord).map(rec=> {
                    return addOrUpdateTable(dbConn, 'FileAttachments',
                        {recordtype: "pageTextFile",
                          fileLink: rec.fileLink,
                          datePosted: new Date(),
                          recorddesc: rec.recorddesc,
                          parentId:parentId,
                          sourceUriCRC:rec.sourceUriCRC,
                      },
                        {  sourceUriCRC:rec.sourceUriCRC,
                            recordtype: "pageTextFile",
                        })
                        .then(dbrec=> {
                            return Object.assign({}, rec, {id:dbrec[0].id})
                        })
                }))
                // return xlate
                return Promise.resolve("xlate")
            } )
        }) //serverDirs
    })
}
//=============================================
function processComplexPage(dbConn=knexConnection, pageLinkData) {
    return addPageTextFromRec(dbConn, pageLinkData)
    .then(pageTextRec => {
        return addPublicRecordsFromRec(dbConn,pageTextRec[0].id, pageLinkData)
        .then(publicRec => {
            return Promise.resolve(pageTextRec[0])
        })
    })
    .then( pageTextRec => {
        // Log FileAttachments
        // console.log('Log FileAttachments', pageTextRec);
        return transferFileAttachmentsForRec(dbConn,pageTextRec.id, pageLinkData)
        .then(fileAttachRecords=> {
            // Get modified pageText
            const newPageTextMarkdown = replaceFileLinks(pageTextRec, fileAttachRecords)
            // Log page record
            return addOrUpdateTable(
                dbConn, 'PageText',
                Object.assign({},pageTextRec,
                {  markdown:newPageTextMarkdown,
                    html:marked(newPageTextMarkdown)
                }),
                {id:pageTextRec.id}
            )
            .then( () => Promise.resolve('Processed: ' + pageLinkData.fileLink))
        })
    })
    // return Promise.resolve(pageLinkData.type)
}
//=============================================
function translateFileHelpfulLink($, rec, fileData) {
    return $(fileData).find('table > tbody').children().map( (i, el)  =>{
        return { uri:cleanURI(rec.fileLink + '/../' +  $(el).find('a').attr('href')),
         label: $(el).find('a').text()
        }
    }).get()
}
//=============================================
function getPageLinks(rec, fileData) {
    var $ = cheerio.load(fileData);
    const links = $(fileData).find('.field-name-body a')

    let result = []
    links.each( (i,el)  =>{
        const href=$(el).attr('href')
        const uri = href.startsWith('http')? href: cleanURI(rec.fileLink + '/../' + href)
        const obj = { uri:uri,
         label: $(el).text(),
         href:href
        }
        result =result.concat(obj)
    })
    return result
}
//=============================================
function getCleanMarkdown(pageData) {
    var $ = cheerio.load(pageData);
    const lines = $(pageData).find(".content").children().map( (i,el) => {
        return ($(el).text().trim().length > 0) ? $(el).html().trim(): ""
    } ).get().filter(line=>line.length > 0).join('')
    // TODO: Delete other 'empty' elements
    return toMarkdown(lines, { gfm: true })
}
//=============================================
function migrateNewDurhamHelpfulLinks(knexConnection) {
    const ignoredPageLinks = ["/public-hearing-materials$", "/recreation$"]
    const departmentPages = ["/planning-board$", "/new-durham-public-library$"]

    return knexConnection("PublicRecords").select(['id','pageLink','fileLink','recorddesc'])
    .where('fileLink', 'like', '%newdurhamnh.us%')
    .then(results => {
        return Promise.all(results
            .filter(rec =>!rec.fileLink.endsWith("/files"))
            // .slice(0,1)
            .map(rec => {
            return cachingFetchURL(rec.fileLink)
            .then(fetchedData => {
                var $ = cheerio.load(fetchedData.data);
                const pageData = $("#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article")
                if($(pageData).html().length === 0) return {type:"Unk"}
                if ($(pageData).find(".field-type-file").text()) {
                    return Object.assign({},rec, {
                        type:'Files',
                        id:rec.id,
                        fileLink:rec.fileLink,
                        files:translateFileHelpfulLink($, rec, $(pageData).find(".field-type-file"))
                    })
                }

                const matchesFileLinkExpression = (expressions, rec) =>
                    expressions.reduce( (acc,val)=> acc ||  rec.fileLink.match(new RegExp(val)) , false)
                if(matchesFileLinkExpression(ignoredPageLinks, rec) ) return Object.assign({},{type:'Skipped'}, rec)
                if(matchesFileLinkExpression(departmentPages, rec) ) return Object.assign({},{type:'DepartmentLink'}, rec)

                const links = getPageLinks(rec, pageData)
                if(links.length === 0){
                    return Object.assign({},{type:'SimplePage', pageText:getCleanMarkdown(pageData)}, rec)
                }
                return Object.assign({},{type:'ComplexPage'}, {links:links, pageText:getCleanMarkdown(pageData)}, rec)
            })
        }))
    })
    .then(primaryData=> {
        return Promise.all(primaryData.map( pageLinkData => { //slice(3,4).
            // console.log('pageLinkData', pageLinkData);
            switch (pageLinkData.type) {
                case 'SimplePage':
                    return processSimplePage(knexConnection, pageLinkData)
                    break;
                case 'Files':
                    return processFileListPage(knexConnection, pageLinkData)
                    break;
                case 'ComplexPage':
                    return processComplexPage(knexConnection, pageLinkData)
                    break;
                case 'Skipped':
                    return "Skipper"
                    break;
                default:
                    return Promise.resolve("******"+pageLinkData.type)
            }
        }))

    })
}
//=============================================
//=============================================
if (require.main === module) {
    process.on('warning', e => console.warn(e.stack));
    process.setMaxListeners(0);

    migrateNewDurhamHelpfulLinks(knex)
    .then(done => {
        // console.log('done', require('util').inspect(done.filter(rec=>rec.type === 'ComplexPage'), { depth: null }));
        done.map(linkData=>{
            console.log(require('util').inspect(linkData, { depth: null }));
            console.log('------------');
        })
        // console.log('done', require('util').inspect(done, { depth: null }));
        process.exit()
    })
    .catch(err => {
        console.log('Error', err);
        process.exit()
    })
}

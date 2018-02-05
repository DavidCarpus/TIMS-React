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
var getSourceServerHost = require('../server/serverIO').getSourceServerHost;


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

//------------------------------------------------
const translateURI = (uri ) => {
    // console.log('translateURI', uri);
    let newURI = uri.startsWith('file:')?
        uri.replace('file:///home/dcarpus/code/currentSites/', 'http://').replace(/\.html$/,''):
        uri
    if(newURI.lastIndexOf("http") > 0){
        newURI = newURI.substring(newURI.lastIndexOf("http"))
    }
    if(newURI.lastIndexOf("http") > 0){
        newURI = newURI.substring(newURI.lastIndexOf("http"))
        console.log('***' , uri, newURI);
        process.exit()
    }
    return newURI
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
    // console.log('processFileListPage:pageLinkData',pageLinkData);
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
function replaceFileLinks(markdownText, linkRecords) {
    // console.log('*** replaceFileLinks(markdownText, linkRecords)', markdownText, linkRecords );
    const newPageText = linkRecords.filter(link=> !link.error).reduce( (acc, link )=>{
        return acc.replace('('+link.href+')', '(ViewFile/' + link.id + ')')
    }, markdownText)
    return newPageText
}
//=============================================
function pullLocalFileAttachment(dbConn=knexConnection, link){
    const sourceUriCRC= crc.crc32(link.uri).toString(16)
    const externalURI = (uri) => uri.indexOf( getSourceServerHost()) === -1

    // console.log('pullLocalFileAttachment:', link.uri);
    if(externalURI(link.uri)) {
        // console.log('externalURI', link.uri);
        return Promise.resolve({
            dest : link.uri,
            fileLink: link.uri,
            recorddesc:link.label,
            href:link.href,
            sourceUriCRC:sourceUriCRC,
            external: true
        })
    }

    return cachingFetchURL(link.uri)
    .then(fetchedData =>{
        const sourceContentType = fetchedData.contentType
        const src = fetchedData.location
        const fileLink ='PageAttachments/' + sourceUriCRC + extensionFromContentType(sourceContentType)
        return Promise.resolve({ src: src,
            dest : getServerFilePath()+fileLink,
            fileLink: fileLink,
            recorddesc:link.label,
            href:link.href,
            sourceUriCRC:sourceUriCRC
        })
    })
    .catch(err=> {
        // console.log('Err processing', {sourcePage:rec.fileLink, href:link.href, label:link.label}, err);
        console.log('Err processing', {href:link.href, label:link.label}
        // , err
        );
        return Promise.resolve({
            dest : link.uri,
            fileLink: link.uri,
            recorddesc:link.label,
            href:link.href,
            sourceUriCRC:sourceUriCRC,
            error: true
        })

    })
}
//=============================================
function transferFileAttachmentsForRec(dbConn=knexConnection, parentId, rec){
    // console.log('transferFileAttachmentsForRec',rec);
    // pushFileToServer( fullPathLocalFile, serverDest )
    const serverDir = getServerFilePath()+'/PageAttachments/'
    // console.log('serverDir',serverDir);
    return Promise.all(rec.links.map(link=>
        pullLocalFileAttachment(dbConn, link)
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
    // console.log('processComplexPage', pageLinkData.pageText, Object.keys(pageLinkData));
    // const validRecord  = (rec) => typeof rec !== 'undefined'
    // return Promise.all(pageLinkData.links.filter(validRecord).map(rec=> {

    return addPageTextFromRec(dbConn, pageLinkData)
    .then(pageTextRec => {
        return addPublicRecordsFromRec(dbConn,pageTextRec[0].id, pageLinkData)
        .then(publicRec => {
            return Promise.resolve(pageTextRec[0])
        })
        .then(pageTextRecDBEntry => {
            return pullNewServerDirs(getServerFilePath(), ['PageAttachments'] )
            .then( serverDirs => {
                let allPaths= mergeArrays(serverDirs)
                const notOnServer = (rec) => !allPaths.includes(rec.fileLink)
                const invalidLinkToCopy = (rec) =>  (!rec.src || rec.fileLink.startsWith('http'))
                const validLinkToCopy = (rec) => !invalidLinkToCopy(rec)

                return Promise.all(pageLinkData.links.filter(notOnServer).filter(validLinkToCopy)
                .map(rec =>
                    pushFileToServer(rec.src, getServerFilePath()+ rec.fileLink)
                    .then( pushReq => rec)
                    .catch(err => console.log(err, rec))
                ))
                .then( copiedFiles=>  Promise.resolve(pageTextRecDBEntry) )
            })
        })
    })
    .then( (ptentry)=>{
        // console.log('ptentry',ptentry);
        return Promise.all(pageLinkData.links.map(rec=> {
            const parentId = ptentry.id
            return addOrUpdateTable(dbConn, 'FileAttachments',
            {
                recordtype: "pageTextFile",
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
        .then(fileDBEntries => {
            // console.log('ptentry',ptentry);
            const newPageTextMarkdown = replaceFileLinks(ptentry.markdown, fileDBEntries)
            return addOrUpdateTable(
                dbConn, 'PageText',
                Object.assign({},ptentry,
                    {  markdown:newPageTextMarkdown,
                        html:marked(newPageTextMarkdown)
                    }),
                    // {fileLink: ptentry.fileLink}
                    {id:ptentry.id}
            )
        })
    })
}
//=============================================
function translateFileHelpfulLink($, rec, fileData) {
    return $(fileData).find('table > tbody').children().map( (i, el)  =>{
        return {
            uri:translateURI(cleanURI(rec.fileLink + '/../' +  $(el).find('a').attr('href'))),
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
        // const uri = href.startsWith('http')? href: cleanURI(rec.fileLink + '/../' + href)
        const uri = translateURI(href.startsWith('http')? href: cleanURI(rec.fileLink + '/../' + href))
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
    const ignoredPageLinks = ["/public-hearing-materials$", "/recreation$", "/town-new-durham-tax-maps$" ]
    const departmentPages = ["/planning-board$", "/new-durham-public-library$"]

    return knexConnection("PublicRecords").select(['id','pageLink','fileLink','recorddesc'])
    .where('fileLink', 'like', '%newdurhamnh.us%')
    .orderBy('id')
    .then(results => {
        const matchesFileLinkExpression = (expressions, rec) =>
            expressions.reduce( (acc,val)=> acc ||  rec.fileLink.match(new RegExp(val)) , false)
        return Promise.all(results
            .filter(rec =>rec.fileLink.indexOf("/files/") === -1)
            .filter(rec =>rec.fileLink.indexOf("/links/") === -1)
            // .slice(13,14)
            .map(rec => {
                rec.pos=1

            return cachingFetchURL(rec.fileLink)
            .then(fetchedData => {
                rec.pos += 1
                var $ = cheerio.load(fetchedData.data);
                const pageData = $("#block-system-main > div > div > div > div > div > div.panel-pane.pane-node-content > div > div > article")
                if($(pageData) === null || $(pageData).html() === null) {
                    // console.log('No Article:' , rec.fileLink);
                    return {type:"Unk", fileLink: rec.fileLink, err:'No Article'}
                }
                if($(pageData).html().length === 0) return {type:"Unk"}
                if ($(pageData).find(".field-type-file").text()) {
                    return Object.assign({},rec, {
                        type:'Files',
                        id:rec.id,
                        fileLink:rec.fileLink,
                        files:translateFileHelpfulLink($, rec, $(pageData).find(".field-type-file"))
                    })
                }
                rec.pos += 1

                if(matchesFileLinkExpression(ignoredPageLinks, rec) ) return Object.assign({},{type:'Skipped'}, rec)
                if(matchesFileLinkExpression(departmentPages, rec) ) return Object.assign({},{type:'DepartmentLink'}, rec)

                rec.pos += 1

                const links = getPageLinks(rec, pageData)
                if(links.length === 0){
                    return Object.assign({},{type:'SimplePage', pageText:getCleanMarkdown(pageData)}, rec)
                }
                return Object.assign({},{type:'ComplexPage'}, {links:links, pageText:getCleanMarkdown(pageData)}, rec)
            })
            .catch(err=> {
                return {type:"Unk", fileLink: rec.fileLink, err:err, rec:rec}
                console.log('**Error processing ', rec);
                // return Promise.reject('**Error processing '+ JSON.stringify(rec))
            })

        }))
    })
    .then(preFileFetch => {
        return Promise.all(preFileFetch
            .filter(pageLinkData=>pageLinkData.type === 'ComplexPage')
            .map( pageLinkData => { //slice(3,4).
                return Promise.all(
                    pageLinkData.links.map( (rec) => pullLocalFileAttachment(knexConnection, rec) )
                )
                .then(newLinkRecs => {
                    // console.log('newLinkRecs',newLinkRecs);
                    const badLinks = (link) => typeof link === 'undefined' || typeof link.href === 'undefined' || typeof link.error !== 'undefined'
                    const badLinkList = newLinkRecs.filter( badLinks)
                    if(badLinkList.length > 0){
                        console.log('----------');
                        console.log('Bad links',
                        // pageLinkData,
                        badLinkList);
                        console.log('----------');
                    }
                    pageLinkData.links = newLinkRecs
                    return pageLinkData
                })
            })
        )
        .then( (xfered)=> {
            // console.log('xfered', xfered);
            return preFileFetch
        })
    })

    .then(primaryData=> {
        return Promise.all(primaryData.map( pageLinkData => { //slice(3,4).
            switch (pageLinkData.type) {
                case 'SimplePage':
                    return processSimplePage(knexConnection, pageLinkData)
                    break;
                case 'Files':
                    return processFileListPage(knexConnection, pageLinkData)
                    break;
                case 'ComplexPage':
                    // console.log('pageLinkData', pageLinkData);
                    return processComplexPage(knexConnection, pageLinkData)
                    break;
                case 'Skipped':
                    return "Skipper"
                    break;
                case 'Unk':
                // return "Unknown:" + pageLinkData.fileLink
                return "Unknown:" + JSON.stringify(pageLinkData);
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
            // console.log('linkData',linkData);
            // console.log(require('util').inspect(linkData, { depth: null }));
            // console.log('------------');
        })
        // console.log('done', require('util').inspect(done, { depth: null }));
        process.exit()
    })
    // .catch(err => {
    //     console.log('Error', err);
    //     process.exit()
    // })
}

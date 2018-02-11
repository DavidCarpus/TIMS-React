var express = require('express');
var router = express.Router();              // get an instance of the express Router
var cors = require('cors');
var addMonths = require('date-fns/add_months')

var knexConfig = require('../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

var fs = require('fs');
var mime = require('mime');

var Config = require('../config');
configuration = new Config();

var {getGroupMeetingDocuments, getPublicDocDataWithAttachments, getPublicDocData, fetchPublicRecordPage, fetchPublicDocsDataFromDB} = require('../../libs/PublicDocs');
var {pullNewsListForGroup, pullNewsDetailsWithAttachmentMeta} = require('../../libs/News');
var {pullMenusFromDB} = require('../../libs/Menus');
var {pullGroupData} = require('../../libs/Groups');
var {pullLinksFromDB} = require('../../libs/Links');

var {submitAlertRequestData} = require('../libs/AlertRequests');
var {getHomeCalendarDateRange} = require('../libs/date');
var {pullAgendaIDFromDB, getCalendarDataForMonth, getCalendarDataForRange} = require('../libs/calendar/ICSCalendar');

router.use(cors());
// ==========================================================
router.get('/Links', function(req, res) {
    pullLinksFromDB(knex)
    .then( toSend => {
        res.json(toSend.sort((a,b) =>  (a.desc > b.desc) ? 1 : ((b.desc > a.desc) ? -1 : 0) ) );
    })
});
// ==========================================================
router.get('/Menus', function(req, res) {
    pullMenusFromDB(knex)
    .then(groupedMenus =>{
        res.json(groupedMenus);
    })
});
// ==========================================================
router.get('/CalendarEvents/:year/:month', function(req, res) {
    // this.services['calendar'].config
    if(req.app.get('processManagement'))
        console.log('******:',req.app.get('processManagement').getConfig('calendar'));
// https://www.thepolyglotdeveloper.com/2015/05/get-remote-html-data-and-parse-it-in-express-for-nodejs/
    let range = getHomeCalendarDateRange()
    if(req.params.year && req.params.month){
        range[0] = new Date(req.params.year,  req.params.month, 1)
        range[1] = addMonths(range[0], 1)
    }

    const addAgendaIDFromDB = (evt) => {
        return pullAgendaIDFromDB(evt.pageLink, evt.startDate).then(id=> {
            return Promise.resolve(Object.assign({}, evt, {agendaID:id}))
        })
    }

    getCalendarDataForRange(range[0], range[1])
    .then(events=> Promise.all(events.map(addAgendaIDFromDB)) )
    .then(withAddedAgendaID=> {
        res.json(withAddedAgendaID);
    })
    .catch(err=> console.log('err', err))
})
// ==========================================================
router.get('/NewsAttachment/:fileID', function(req, res) {
    getPublicDocDataWithAttachments(knex, "FileAttachments", req.params.fileID)
    .then(docData => {
        const fileToSend = docData.fileLink ||  docData.attachments[0].fileLink
        res.setHeader('Content-type', mime.lookup(fileToSend));
        res.download(fileToSend, fileToSend.replace(/^.*[\\\/]/, ''))
         // res.json(docData);
    })
})
// ==========================================================
router.get('/ViewFile/:fileID', function(req, res) {
    getPublicDocDataWithAttachments(knex, "FileAttachments", req.params.fileID)
    .then(docData => {
        const fileToSend =  docData[0].attachments[0].fileLink || docData[0].fileLink
        fs.readFile(fileToSend, function(err, contents) {
            res.json(Object.assign({},
                {
                    FileType:mime.lookup(fileToSend), id:req.params.fileID, path: fileToSend,
                    filename:fileToSend.replace(/^.*[\\\/]/, ''), Description:docData.recorddesc
                }
                ,{FileData:contents?contents.toString('base64'):""}
            ))
        });
     })
})
// ==========================================================
router.get('/SendFile/:fileID', function(req, res) {
    getPublicDocDataWithAttachments(knex, "FileAttachments", req.params.fileID)
    .then(docData => {
        const fileToSend = docData.fileLink ||  docData.attachments[0].fileLink
        res.setHeader('Content-type', mime.lookup(fileToSend));
        res.download(fileToSend, fileToSend.replace(/^.*[\\\/]/, ''))
         // res.json(docData);
    })
})
// ==========================================================
router.get('/fetchFile/:fileID', function(req, res) {
    getPublicDocData(knex, req.params.fileID)
    .then(docData => {
        const fileToSend = docData.fileLink ||  docData.attachments[0].fileLink
        res.setHeader('Content-type', mime.lookup(fileToSend));
        res.download(fileToSend, fileToSend.replace(/^.*[\\\/]/, ''))
        // res.sendFile(fileToSend)
         // res.json(docData);
    })
});
// ==========================================================
router.get('/EB2Services/:groupName', function(req, res) {
    var groupName = req.params.groupName;
    return dbConn('ExternalServices').select(["*"])
    .where({'servicetype': 'EB2Service'})
    .then(data =>{
        if ( groupName === 'Home' || groupName ===  'TownClerk' ){
            res.json(data);
        } else {
            res.json(data.filter(row => row.pageLink));
        }
    })
});
// ==========================================================
router.get('/FAQ/:groupName', function(req, res) {
    var groupName = req.params.groupName;
    return dbConn('FAQ').select(["question", "answer"])
    .where({'pageLink': groupName})
    .then(data =>{
        res.json(data);
    })
});
// ==========================================================
router.get('/Records/NewsDetails/:id', function(req, res) {
    pullNewsDetailsWithAttachmentMeta(knex, req.params.id)
    .then(withAttachments => {
        res.json(withAttachments);
    });
})
// ==========================================================
router.get('/Records/News/:groupName', function(req, res) {
    pullNewsListForGroup(knex, req.params.groupName)
    .then(records => {
        res.json(records);
    });
})
// ==========================================================
router.get('/PublicRecordPage/:pageURL', function(req, res) {
    // console.log('req.query', req.params);
    fetchPublicRecordPage(knex, req.params.pageURL)
    .then( toSend => {
        // console.log('toSend', toSend);
        res.json(toSend);
    })
});
// ==========================================================
router.get('/Records/PublicDocs/filtered', function(req, res) {
    // console.log('req.query', req.query.recordType);
    fetchPublicDocsDataFromDB(knex, req.query, 100)
    .then( toSend => {
        res.json(toSend);
    })
});
// ==========================================================
router.get('/Records/Meetings/:groupName', function(req, res) {
    getGroupMeetingDocuments(knex,req.params.groupName)
    .then( toSend => {
        res.json(toSend);
    })
});

// ==========================================================
router.get('/GroupData/:groupName', function(req, res) {
    var groupName = req.params.groupName;
    pullGroupData(knex, groupName)
    .then( toSend => {
        // console.log('toSend',toSend);
        res.json(toSend);
    })
});

// ==========================================================
// ==========================================================
router.post('/AlertRequests/', function(req, res) {
    var data = req.body;
    submitAlertRequestData(data)
    .then(submission => {
        console.log('AlertRequests', require('util').inspect(submission, { depth: null }));
        res.json(submission);
    })
});

// ==========================================================
// ==========================================================
// module.exports =  {router, handleDisconnect};
module.exports =  {router};

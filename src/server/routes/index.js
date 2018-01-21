var express = require('express');
var router = express.Router();              // get an instance of the express Router
var cors = require('cors');
var startOfMonth = require('date-fns/start_of_month')
var endOfMonth = require('date-fns/end_of_month');
var startOfWeek = require('date-fns/start_of_week')
var addWeeks = require('date-fns/add_weeks')
var addMonths = require('date-fns/add_months')

var normalizeRecordType = require('../../libs/PublicDocs').normalizeRecordType;
var fetchPublicDocs = require('../../libs/PublicDocs').fetchPublicDocs;

var submitAlertRequestData = require('../libs/AlertRequests').submitAlertRequestData;

var knexConfig = require('../libs/db/knexfile.js')
var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

var mysql = require('mysql');
var fs = require('fs');
var mime = require('mime');
var marked = require('marked');
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var emailValidate = require("email-validator");

var addDays = require('date-fns/add_days')

var Config = require('../config');
configuration = new Config();
const privateDir = configuration.mode === 'development' ? '../../private/'+process.env.REACT_APP_MUNICIPALITY: '../../private/'

// var connection;
var mysql_pool = require('../libs/db/mysql').mysql_pool;

var getCalendarDataForMonth = require('../libs/calendar/ICSCalendar').getCalendarDataForMonth;
var getCalendarDataForRange = require('../libs/calendar/ICSCalendar').getCalendarDataForRange;
var pullAgendaIDFromDB = require('../libs/calendar/ICSCalendar').pullAgendaIDFromDB;
var {getHomeCalendarDateRange} = require('../libs/date');

router.use(cors());
// ==========================================================
function simpleDBQuery(query){
    return new Promise(function(resolve, reject) {
        // console.log('mysql_pool', mysql_pool);
        mysql_pool.getConnection(function(err, connection) {
    		if (err) {
    			connection.release();
    	  		reject(' Error getting mysql_pool connection: ' + err);
    	  		throw err;
    	  	}
            connection.query(query, function(err, rows){
                if (err) {
                    console.log(require('util').inspect(err, { depth: null }));
                    reject(err)
                }
                connection.release();
                resolve( rows);
            });
        })
    });
}
// ==========================================================
function flattenMenus(parent, menus, results) {
    let links = menus.map(level1 => {
        if (level1.menus) {
            return flattenMenus(level1.link, level1.menus, results)
        }
        if (level1.link.startsWith('http')) {
            return results.push({desc:level1.desc, link:level1.link})
        } else {
            return results.push({desc:level1.desc, link:parent+level1.link})
        }
    })
        return results;
}
// ==========================================================
router.get('/Links', function(req, res) {
    // let menus = JSON.parse(fs.readFileSync('./private/Menus.json', 'utf8'));
    // let links =flattenMenus('',menus, [])
    let links = [];
    console.log(links);
    links.push({desc:'Contact Us', link:'/ContactUs'})
    links.push({desc:'Employment', link:'/Employment'})

    let query = "Select datadesc as description, fileLink as link from ListData where listName='HelpfulLinks'";
    simpleDBQuery(query)
    .then(rows => {
        rows.map(row => {
            links.push({desc: row.description, link:row.link});
        })
    })
    .then(rows => {
        // console.log('Add Menus from DB');
        let query = "Select description, pageLink, fullLink as link from Menus";
        simpleDBQuery(query)
        .then(rows => {
            // console.log('rows:', rows);
            rows.map(row => {
                let link = row.link;
                if (row.pageLink.startsWith('http')) {
                    link = row.pageLink;
                }
                links.push({desc: row.description, link:link});
            })
        })
        .then(rows => {
            return links.sort((a,b) => {
                return (a.desc > b.desc) ? 1 : ((b.desc > a.desc) ? -1 : 0);
            })
        })
        .then(rows => {
            let query = "Select recorddesc as description, pageLink, fileLink as link from PublicRecords where recordtype='HelpfulInformation'";
            return simpleDBQuery(query)
            .then(rows => {
                rows.map(row => {
                    links.push({desc: row.description, link:row.link});
                })
                return links
            })
        })
        .then(allLinks => {
            let sorted = allLinks.sort((a,b) => {
                return (a.desc > b.desc) ? 1 : ((b.desc > a.desc) ? -1 : 0);
            })
            // res.status(200).send('<pre>' + JSON.stringify(links, null, 2) + '</pre>');
            res.json(sorted);
        })
    })

    .catch(err => {
        console.log('HelpfulLinks Err:', err);
    })
    // res.json(links);
});
// ==========================================================
router.get('/Menus', function(req, res) {
    var query = "Select * from Menus";
     simpleDBQuery(query)
     .then(rows => {
         let groupedMenus = rows.reduce( (acc, curr, i) => {
             let topMenu = curr.fullLink;
             let subMenus = []

             if (curr.fullLink !== curr.pageLink) {
                 topMenu = topMenu.replace(curr.pageLink, '')
             }
             if (topMenu.endsWith('/') && curr.fullLink !== '/' ) {
                 topMenu = topMenu.substring(0, topMenu.length - 1);
             }

             acc[topMenu] = (acc[topMenu] && typeof acc[topMenu] !== undefined) ? acc[topMenu]: {};

             if (curr.fullLink !== curr.pageLink && acc[topMenu].menus) {
                 acc[topMenu]['menus'].push( {id:curr.id, pageLink:curr.pageLink, fullLink:curr.fullLink, description:curr.description})
             }

             if (curr.fullLink !== curr.pageLink && !acc[topMenu].menus) {
                 acc[topMenu]['menus'] = [{id:curr.id, pageLink:curr.pageLink, fullLink:curr.fullLink, description:curr.description}]
             }

             if (curr.fullLink === curr.pageLink) {
                 acc[topMenu] = Object.assign(acc[topMenu], {id:curr.id, pageLink:curr.pageLink, fullLink:curr.fullLink, description:curr.description})
             }
             return acc;
         }, {})
        //  res.status(200).send('<pre>' + JSON.stringify(groupedMenus, null, 2) + '</pre>');
        //  console.log('groupedMenus:' + JSON.stringify(groupedMenus));
         res.json(groupedMenus);
     });
});
// ==========================================================
router.get('/Menus1', function(req, res) {
        // console.log(fs.readFileSync('Menus.json', 'utf8'));
        // TODO: Add error checking if file not there ar move data to db
        res.json(JSON.parse(fs.readFileSync('./private/Menus.json', 'utf8')));
});
// ==========================================================
router.get('/Asides/:groupName', function(req, res) {
    var query = "Select id, html as description, link from PageAsides where pageLink= '" +req.params.groupName +"' ";
         simpleDBQuery(query)
         .then(rows => {
            //  console.log('Asides:' + JSON.stringify(rows));
             res.json(rows);
         });
        //  res.json([]);
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
    var query = "Select id, fileLink as link from FileAttachments where id = '" + req.params.fileID +"' ";
    let cnt=0
    const fullAttachmentPath = __dirname+'/'+privateDir+ "/Attachments/"

    console.log('NewsAttachment',query);
     simpleDBQuery(query)
     .then(rows => {
         let fullPath = rows[0].link;
         if (!fullPath.startsWith('http')) {
             fullPath = fullAttachmentPath + fullPath
         }
         let filename =  fullPath.replace(/^.*[\\\/]/, '')
         console.log('fetchFile:' + filename+ ' from ' + fullPath );
         var mimetype = mime.lookup(fullPath);
         console.log('mimetype:' + mimetype);

         // this is only if you want to 'force' a 'download' and NOT let browser open the file
        //  res.setHeader('Content-disposition', 'attachment; filename=' + filename);

        res.setHeader('Content-type', mimetype);
        // res.sendFile(fullPath)
        console.log('download...',fullPath, filename);
        res.download(fullPath, filename)
        //  res.json(rows);
     });

})
// ==========================================================
router.get('/fetchFile/:fileID', function(req, res) {
        var query = "Select id, fileLink as link from PublicRecords where id = '" + req.params.fileID +"' ";
         simpleDBQuery(query)
         .then(rows => {
             let fullPath = rows[0].link;
             if (!fullPath.startsWith('http')) {
                 let attachmentPath=configuration.attachmentPath;
                 fullPath = fullPath.replace("." + configuration.attachmentPath, '');
                //  console.log('fetchFile- append ATTACHMENT_DIR?:' + attachmentPath);
                //  fullPath = configuration.ATTACHMENT_DIR + fullPath
                 fullPath = __dirname + attachmentPath + fullPath

                //  console.log('fetchFile- appended ATTACHMENT_DIR?:' + fullPath);
                 fullPath = fullPath.replace('routes','') ;
                 fullPath = fullPath.replace('//', '/');
             }
             let filename =  fullPath.replace(/^.*[\\\/]/, '')
             console.log('fetchFile:' + filename+ ' from ' + fullPath );
             var mimetype = mime.lookup(fullPath);
             console.log('mimetype:' + mimetype);

             // this is only if you want to 'force' a 'download' and NOT let browser open the file
            //  res.setHeader('Content-disposition', 'attachment; filename=' + filename);

            res.setHeader('Content-type', mimetype);
            // res.sendFile(fullPath)
            console.log('download...');
            res.download(fullPath, filename)
            //  res.json(rows);
         });
});
// ==========================================================
router.get('/EB2Services/:groupName', function(req, res) {
        if ( req.params.groupName == 'Home' || (req.params.groupName ==  'TownClerk')) {
            query = "Select * from ExternalServices where servicetype='EB2Service' ";
        }else {
            query = "Select * from ExternalServices where servicetype='EB2Service' and  pageLink= '" + req.params.groupName +"' ";
        }
         simpleDBQuery(query)
         .then(rows => {
            //  console.log('ExternalServices:' + JSON.stringify(rows));
             res.json(rows);
         });

});
// ==========================================================
router.get('/Records/DocumentsForMonth/:groupName/:documentType/:year/:month', function(req, res) {
        console.log("groupName:",req.params.groupName );
        query = "Select id, recorddesc as description, fileLink as link, date, expiredate from PublicRecords ";
        query += " where pageLink='"  + req.params.groupName +"' and recordtype='" + req.params.documentType + "'";
        query += " and year(date)='"  + req.params.year +"' and month(date)='" + req.params.month + "'";
        console.log("query:",query);
        simpleDBQuery(query)
        .then(rows => {
            // console.log('Documents:' + JSON.stringify(rows));
            res.json(rows);
        });
});
// ==========================================================
router.get('/Records/Documents/:groupName', function(req, res) {
        query = "Select id, viewcount, recorddesc as description, fileLink as link, expiredate, date from PublicRecords ";
        query += " where pageLink='"  + req.params.groupName +"' and recordtype='Document'";

        simpleDBQuery(query)
        .then(rows => {
            // console.log('Documents:' + JSON.stringify(rows));
            res.json(rows);
        });
});
// ==========================================================
router.get('/FAQ/:groupName', function(req, res) {
        query = "Select question, answer from FAQ where pageLink='"+ req.params.groupName + "' ";
         simpleDBQuery(query)
         .then(rows => {
            //  console.log('FAQ:' + JSON.stringify(rows));
             res.json(rows);
         })
         .catch(err => {
             // res.json('Error', JSON.stringify(err))
             console.log('Fetch data error');
             console.log(require('util').inspect(err, { depth: null }));
             res.status(404).json(err);
         });
});
// ==========================================================
router.get('/Records/NewsDetails/:id', function(req, res) {
    query   = "Select News.id, News.summary, News.html, News.markdown, "
    query   += "News.datePosted, News.dateExpires, News.pageLink "
    query   += "from News "
    query   += "left join FileAttachments on News.id=FileAttachments.id "
    query   += "where (FileAttachments.recordtype = 'news' or isnull(FileAttachments.recordtype))"
    query += " and News.id='" + req.params.id +"'";

    // console.log(query);
     simpleDBQuery(query)
     .then( newsData =>{
         query   =  "Select id, fileLink, datePosted as filePostedDate "
         query   += "from FileAttachments "
         query   += "where parentID ='" + req.params.id +"'";
         return simpleDBQuery(query)
         .then(attachments =>  Object.assign({}, newsData, {attachments:attachments}) )
     })
     .then(withAttachments => {
         // console.log('NewsDetails:' + JSON.stringify(withAttachments));
         res.json(withAttachments);
     });
})
// ==========================================================
router.get('/Records/News/:groupName', function(req, res) {
    query   = "Select id, summary, datePosted, dateExpires, pageLink from News "
    if (  req.params.groupName == 'Home') {
        query += " where mainpage=1 ";
    } else {
        query += " where pageLink='" + req.params.groupName +"'";
    }
    query += "  and (dateExpires <=0 or date(dateExpires) > date(now()) ) ";
    // console.log(query);
     simpleDBQuery(query)
     .then(rows => {
         // console.log('Notices:' + JSON.stringify(rows));
         res.json(rows);
     });
})
// ==========================================================
router.get('/Records/Notices/:groupName', function(req, res) {
        query   = "Select id, recorddesc as description, fileLink as link, recordtype, date, expiredate, pageLink from PublicRecords "
        if (  req.params.groupName == 'Home') {
            query += " where mainpage=1 ";
        } else {
            query += " where pageLink='" + req.params.groupName +"'";
        }

        query += " and (recordtype='Notice' or recordtype='RFP')";
        query += "  and (isnull(expiredate) or date(expiredate) > date(now()) ) ";
        // query += " and (expiredate is null or expiredate > now() ) ";
// console.log('Records/Notice:query:', query);
         simpleDBQuery(query)
         .then(rows => {
            //  console.log('Notices:' + JSON.stringify(rows));
             res.json(rows);
         });
});
// ==========================================================
router.get('/Records/NoticesFull/:groupName', function(req, res) {
    query   = "Select id, recorddesc as description, fileLink as link, recordtype,date, expiredate from PublicRecords "
    if (  req.params.groupName == 'Home') {
        query += " where mainpage=1 ";
    } else {
        query += " where pageLink='" + req.params.groupName +"'";
    }

        // query = "Select id, recorddesc as description, fileLink as link from PublicRecords where pageLink='" + req.params.groupName +"' and recordtype='Notice'";
        // if (  req.params.groupName == 'Home') {
        //     query = "Select id, recorddesc as description, fileLink as link from PublicRecords where mainpage=1 and recordtype='Notice'";
        // }
         simpleDBQuery(query)
         .then(rows => {
            //  console.log('Notices:' + JSON.stringify(rows));
             res.json(rows);
         });
});
// ==========================================================
router.get('/Records/Notice/:noticeID', function(req, res) {
        // query = "Select id, recorddesc as description, fileLink as link from PublicRecords where id=" + req.params.noticeID;
        query = "Select PublicRecords.id, recorddesc as description, fileLink as link, PageText.html, Groups.groupDescription, recordtype "
        query += " from PublicRecords "
        query += " left join PageText on PageText.id = PublicRecords.PageTextID "
        query += " left join Groups on PublicRecords.pageLink = Groups.pageLink "
        query += " where PublicRecords.id=" + req.params.noticeID;
        console.log(query);
         simpleDBQuery(query)
         .then(rows => {
            //  console.log('Notices:' + JSON.stringify(rows));
             res.json(rows);
         });
});
// ==========================================================
router.get('/Records/PublicDocs/filtered', function(req, res) {
    // console.log('req.query', req.query.recordType);
    // let recordtype = normalizeRecordType(req.query.recordType)
    fetchPublicDocs(knex, req.query)
    .then( toSend => {
        // console.log('toSend', toSend);
        res.json(toSend);
    })
});// ==========================================================
router.get('/Records/Meetings/:groupName', function(req, res) {
    // query = "Select id, recordtype as type, fileLink as link,DATE_FORMAT(date,'%m/%d/%Y') as date from PublicRecords where pageLink='" + req.params.groupName +"'";
    query = "Select id, recordtype as type, fileLink as link, date, recorddesc as description from PublicRecords where pageLink='" + req.params.groupName +"'";
    query += " and ( recordtype='Minutes'  or recordtype='Agenda'  or recordtype='Agendas'  or recordtype='Video'   or recordtype='Decision' )";
    query += "  and (isnull(expiredate) or date(expiredate) > date(now()) ) ";
    query += "  ORDER BY date, recordtype ";
    // console.log('/Records/Meetings/:groupName', query);
    simpleDBQuery(query)
    .then(rows => {
        var toSend = rows.reduce( (newArray, row) => {
            let key = row.date;
            delete row.date;
            (newArray[key] = newArray[key] || []).push(row);
            return newArray;
        }, {})
        // console.log('Meetings:' + JSON.stringify(toSend));
        res.json(toSend);
    });
});

// ==========================================================
router.get('/GroupData/:groupName', function(req, res) {
        var groupName = req.params.groupName;

        // query = "Select id, datadesc as description from ListData where pageLink='" + groupName + "' and listName='OrganizationalUnits'";
        query = "Select *, id, groupDescription as description from Groups where pageLink='" + groupName + "'";
        console.log(query);
        var finalResult = simpleDBQuery(query)
        .then( groupData =>{
            groupData[0].link = groupName;
            query = "Select id, html  as text1 from PageText where sectionName='text1' and pageLink='" + groupData[0].link +"'";
            return simpleDBQuery(query).
            then(pageTextData => {
                if (pageTextData.length > 0) {
                    groupData[0].pagetext = groupData[0].pagetext? groupData[0].pagetext: [];
                    groupData[0].pagetext.push(pageTextData[0])
                }
                return groupData[0];
            })
        })
        .then( groupDataWithText =>{
            // console.log(Object.keys(groupDataWithText));
            query = "Select id, html  as description from PageText where sectionName='desc' and pageLink='" + groupDataWithText.link +"'";
            // console.log('Appending desc query?: ', query);
            return simpleDBQuery(query).
            then(pageDescriptionData => {
                // console.log('Appending desc data?');
                if (pageDescriptionData.length > 0) {
                    // console.log('Appending desc data');
                    groupDataWithText.pagetext = groupDataWithText.pagetext? groupDataWithText.pagetext: [];
                    groupDataWithText.pagetext.push(pageDescriptionData[0])
                }
                return groupDataWithText;
            })
        })

        .then(groupDataWithPageText =>{
            // query = "Select id,name,term,phone, email, office from GroupMembers where pageLink='" + groupDataWithPageText.link +"' ";
            query = "Select GroupMembers.id, concat(firstName, ' ', lastName) as name ,term,Users.phone, Users.emailAddress as email, GroupMembers.office from GroupMembers " +
            " left Join Groups on Groups.id = GroupMembers.groupID " +
            " left Join Users on Users.id = GroupMembers.userID " +
            " where Groups.pageLink='" + groupDataWithPageText.link +"' ";
            console.log(query);
            return simpleDBQuery(query).
            then(members => {
                if (members.length > 0) {
                    groupDataWithPageText.members = members;
                }
                return groupDataWithPageText;
            })
        })
        .then(groupData =>{
            query = "Select id, datatext as wasteType from ListData where pageLink='" + groupData.link +"' and listName='WasteTypes'";
            return simpleDBQuery(query).
            then(wasteTypes => {
                return Promise.all( wasteTypes.map(wasteType => {
                    query = "Select datatext as rule from ListData where listParentID='" + wasteType.id + "' and listName='WasteTypesRules'";
                    return simpleDBQuery(query).
                    then(rules => {
                        var ruleStringArray = rules.map(  rule => {
                            return rule.rule;
                        });
                            wasteType.rules = ruleStringArray;
                            return wasteType;
                    })
                }) // map wasteTypes
            ) //  Promise All
            .catch(err => {
                // res.json('Error', JSON.stringify(err))
                console.log('Fetch WasteTypesRules error', JSON.stringify(err));
                res.status(404).json(err);
            })
        })
        .then(wasteTypesWithRules =>{
            if (wasteTypesWithRules.length > 0) {
                groupData.wastetypes = wasteTypesWithRules;
            }
            return groupData
        })
    })
    .then(groupDataWithWasteTypes =>{
        query = "Select id, recorddesc as description,fileLink from PublicRecords where pageLink='"  + groupDataWithWasteTypes.link +"' and recordtype='Newsletter'";
        return simpleDBQuery(query).
        then(newsletters => {
            if (newsletters.length > 0) {
                groupDataWithWasteTypes.newsletters = newsletters;
            }
            return groupDataWithWasteTypes;
        })
        .catch(err => {
            // res.json('Error', JSON.stringify(err))
            console.log('Fetch newsletters error', JSON.stringify(err));
            res.status(404).json(err);
        })
    })
    .then(groupDataWithNewsletters =>{
        query = "Select id, recorddesc as description,fileLink from PublicRecords where pageLink='"  + groupDataWithNewsletters.link +"' and recordtype='HelpfulInformation'";
        return simpleDBQuery(query).
        then(helpfulinformation => {
            if (helpfulinformation.length > 0) {
                groupDataWithNewsletters.helpfulinformation = helpfulinformation;
            }
            return groupDataWithNewsletters;
        })
    })
    .then(groupData =>{
        if (groupData.link == 'PublicWorks' || groupData.link == 'TransferStationRules') {
            query = "Select id, pricedesc as description, price from Prices";
            return simpleDBQuery(query).
            then(feeschedule => {
                if (feeschedule.length > 0) {
                    groupData.feeschedule = feeschedule;
                }
                return groupData;
            })
        } else {
            return groupData;
        }
    })
    .then(final => {
        // res.status(200).send('<pre>' + JSON.stringify(final, null, 2) + '</pre>');
        res.json(final);
    } )
    .catch(err => {
        // res.json('Error', JSON.stringify(err))
        console.log('Fetch group data error', JSON.stringify(err));
        res.status(404).json(err);
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

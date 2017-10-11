var express = require('express');
var router = express.Router();              // get an instance of the express Router
var cors = require('cors');
var startOfMonth = require('date-fns/start_of_month')

var submitAlertRequestData = require('../libs/AlertRequests').submitAlertRequestData;

var mysql = require('mysql');
var fs = require('fs');
var mime = require('mime');
var marked = require('marked');
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var emailValidate = require("email-validator");

var addDays = require('date-fns/add_days')

var Config = require('../config');
configuration = new Config();
// var connection;
var mysql_pool = require('../libs/db/mysql').mysql_pool;

var getCalendarDataForMonth = require('../libs/calendar/ICSCalendar').getCalendarDataForMonth;

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
        console.log('Add Menus from DB');
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
            // console.log(require('util').inspect(links, {colors:true, depth: null }));
            // res.status(200).send('<pre>' + JSON.stringify(links, null, 2) + '</pre>');
            // res.json(JSON.stringify(links, null, 2) );
            links.sort((a,b) => {
                return (a.desc > b.desc) ? 1 : ((b.desc > a.desc) ? -1 : 0);
            })
            // res.status(200).send('<pre>' + JSON.stringify(links, null, 2) + '</pre>');
            res.json(links);
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
});// ==========================================================
router.get('/CalendarEvents/', function(req, res) {
    // var query = "Select * from CalendarEvents where startDate >= NOW() - INTERVAL 1 DAY order by startDate limit 4 ";
    const now = startOfMonth(new Date())
    const nowStr = now.getUTCFullYear() + '-' + now.getUTCMonth() + '-' + now.getDate()
    // var query = "Select * from CalendarEvents where endDate >= NOW() or endDate is null order by startDate limit 20 ";
    var query = "Select * from CalendarEvents where endDate >= '" + nowStr + "' or endDate is null order by startDate limit 20 ";
    console.log('/CalendarEvents', query);

    simpleDBQuery(query)
    .then(rows => {
        // res.json(rows);
        let startDate  = new Date();
        calendarData = getCalendarDataForMonth(rows, startDate)
        if (calendarData.length === 0 ) {
            calendarData = getCalendarDataForMonth(recordState.CalendarData, addWeeks(startDate,1))
        }
        return calendarData
    })
    .then( calData => {
        // console.log('startDate:', calendarData[0].startDate);
        // console.log('startDate:', addDays(new Date(calendarData[0].startDate), -1));
        // console.log('endDate:', addDays(new Date(calendarData[calendarData.length-1].startDate), 1));
        const year = (new Date(calData[0].startDate)).getUTCFullYear();
        const month = (new Date(calData[0].startDate)).getMonth()+1;
        query = "Select Groups.groupDescription, PublicRecords.id, PublicRecords.date, recordtype"
        query += " from PublicRecords"
        query += " left join Groups on Groups.pageLink= PublicRecords.pageLink"
        query += " where year(date)='"  + year +"' and month(date)='" + month + "'";
        query += " and recordtype = 'Agenda' "
        // query += " and recordtype in ('Agenda', 'Minutes')"

        console.log('query:', query);
        return simpleDBQuery(query)
        .then( recordData => {
            // console.log('recordData:', recordData);
            calData = calData.map(calendarEntry => {
                const matchRecord = recordData.filter(docRecord =>
                    docRecord.date.getMonth() === calendarEntry.startDate.getMonth() &&
                    docRecord.date.getDate() === calendarEntry.startDate.getDate() &&
                    calendarEntry.summary.indexOf(docRecord.groupDescription) >= 0
                )
                if (matchRecord.length > 0) {
                    // console.log('matchRecord:',  matchRecord, '\n',calendarEntry.startDate, calendarEntry.summary);
                    calendarEntry.publicRecords= {recordtype:matchRecord[0].recordtype, id:matchRecord[0].id}
                }

                return calendarEntry
            })
            // return recordData
            return calData
        })
        .then( results => {
            // res.status(200).send('<pre>' + JSON.stringify(results, null, 2) + '</pre>');
            res.json(results);
        })
    })
    .catch(err =>{
        console.error('Error getCalendarDataForMonth(rows, startDate)', err);
    })



});
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
router.get('/Records/PublicDocs/:recordtype', function(req, res) {
    // query = "Select id, recordtype as type, fileLink as link,DATE_FORMAT(date,'%m/%d/%Y') as date from PublicRecords where pageLink='" + req.params.recordtype +"'";
    let recordtype = ''
    switch (req.params.recordtype.toUpperCase()) {
        case 'NOTICES':
        case 'NOTICE':
            recordtype = 'Notice'
        break;
        case 'AGENDAS':
        case 'AGENDA':
            recordtype = 'Agenda'
            break;
        case 'MINUTES':
            recordtype = 'Minutes'
            break;
        case 'DOCUMENTS':
        case 'DOCUMENT':
            recordtype = 'Document'
            break;
        case 'RFPS':
        case 'RFP':
            recordtype = 'RFP'
            break;
        case 'VOTING':
            recordtype = 'Voting'
            break;
        default:

    }
    query = "Select PublicRecords.id, recordtype as type, fileLink as link, date, PublicRecords.pageLink as groupName, Groups.groupDescription, PublicRecords.recorddesc "
    query += "  from PublicRecords ";
    query += "  left join Groups on Groups.groupName =  PublicRecords.pageLink ";
    query += "  where recordtype='" + recordtype +"'";
    query += "  and fileLink is not null";
    query += "  ORDER BY date, recordtype ";
    console.log(query);
    simpleDBQuery(query)
    .then(rows => {
        var toSend = rows.reduce( (newArray, row) => {
            let key = row.date;
            // delete row.date;
            (newArray[key] = newArray[key] || []).push(row);
            return newArray;
        }, {})

        toSend = rows

        // console.log('Meetings:' + JSON.stringify(toSend));
        // res.status(200).send('<pre>' + JSON.stringify(toSend, null, 2) + '</pre>');

        res.json(toSend);
    });
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
        console.log('submission:', submission);
        res.json(data);
    })
});

// ==========================================================
// ==========================================================
// module.exports =  {router, handleDisconnect};
module.exports =  {router};

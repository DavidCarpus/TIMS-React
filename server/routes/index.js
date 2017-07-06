var express = require('express');
var router = express.Router();              // get an instance of the express Router
var cors = require('cors');
var mysql = require('mysql');
var fs = require('fs');
var mime = require('mime');
var marked = require('marked');

var Config = require('../config');
configuration = new Config();
var connection;

function handleDisconnect() {
  connection = mysql.createConnection(configuration.db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.
  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
        var d = new Date();
        var n = d.toString().replace('GMT-0400 (EDT)', '');

      console.log(n + ' *** error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    // console.log('db error', JSON.stringify(err));
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

router.use(cors());
// ==========================================================
function simpleDBQuery(query){
    // console.log('query:', query);
    return new Promise(function(resolve, reject) {
        if(query.length <= 0) {
            reject('Missing Query')
        }
        connection.query(query, function(err, rows){
            if (err) {
                console.log(require('util').inspect(err, { depth: null }));
                reject(err)
            }

            resolve( rows);
        });
    })
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
    let menus = JSON.parse(fs.readFileSync('./private/Menus.json', 'utf8'));
    let links =flattenMenus('',menus, [])
    links.push({desc:'Contact Us', link:'/ContactUs'})
    links.push({desc:'Employment', link:'/Employment'})

    var query = "Select datadesc as description, fileLink as link from ListData where listName='HelpfulLinks'";
    simpleDBQuery(query)
    .then(rows => {
        rows.map(row => {
            links.push({desc: row.description, link:row.link});
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
             if (curr.fullLink !== curr.pageLink) {
                 topMenu = topMenu.replace(curr.pageLink, '')
             }
             if (topMenu.endsWith('/') && curr.fullLink !== '/' ) {
                 topMenu = topMenu.substring(0, topMenu.length - 1);
             }
             if (curr.fullLink === curr.pageLink) {
                 acc[topMenu] = {id:curr.id, pageLink:curr.pageLink, fullLink:curr.fullLink, description:curr.description,'menus':[]}
             }
             acc[topMenu] = acc[topMenu]? acc[topMenu]: {};
             if (curr.fullLink !== curr.pageLink && acc[topMenu].menus) {
                 acc[topMenu]['menus'].push( {id:curr.id, pageLink:curr.pageLink, fullLink:curr.fullLink, description:curr.description})
             }
             return acc;
         }, {})
        //  console.log('Asides:' + JSON.stringify(rows));
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
        var query = "Select id, datadesc as description, fileLink as link from ListData where listName='PageAsides' and  pageLink= '" +
        req.params.groupName +"' ";
         simpleDBQuery(query)
         .then(rows => {
            //  console.log('Asides:' + JSON.stringify(rows));
             res.json(rows);
         });
        //  res.json([]);
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
                 console.log('fetchFile- append ATTACHMENT_DIR?:' + attachmentPath);
                //  fullPath = configuration.ATTACHMENT_DIR + fullPath
                 fullPath = __dirname + attachmentPath + fullPath

                 console.log('fetchFile- appended ATTACHMENT_DIR?:' + fullPath);
                 fullPath = fullPath.replace('routes','') ;
                 fullPath = fullPath.replace('//', '/');
             }
             let filename =  fullPath.replace(/^.*[\\\/]/, '')
             console.log('fetchFile:' + filename+ ' at ' + fullPath );
             var mimetype = mime.lookup(fullPath);
            //  console.log('mimetype:' + mimetype);

            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', mimetype);
            res.sendFile(fullPath)
            // res.download(fullPath, filename)
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
router.get('/Records/Documents/:groupName', function(req, res) {
        query = "Select id, recorddesc as description, fileLink as link from PublicRecords where pageLink='"  + req.params.groupName +"' and recordtype='Document'";
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
        query = "Select id, recorddesc as description, fileLink as link from PublicRecords where pageLink='" + req.params.groupName +"' and recordtype='Notice'";
        if (  req.params.groupName == 'Home') {
            query = "Select id, recorddesc as description, fileLink as link from PublicRecords where mainpage=1 and recordtype='Notice'";
        }
         simpleDBQuery(query)
         .then(rows => {
            //  console.log('Notices:' + JSON.stringify(rows));
             res.json(rows);
         });
});
// ==========================================================
router.get('/Records/Meetings/:groupName', function(req, res) {
    // query = "Select id, recordtype as type, fileLink as link,DATE_FORMAT(date,'%m/%d/%Y') as date from PublicRecords where pageLink='" + req.params.groupName +"'";
    query = "Select id, recordtype as type, fileLink as link, date from PublicRecords where pageLink='" + req.params.groupName +"'";
    query += " and ( recordtype='Minutes'  or recordtype='Agendas'  or recordtype='Video' )";
    query += "  ORDER BY date ";
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

        query = "Select id, datadesc as description, pageLink as link from ListData where pageLink='" + groupName + "' and listName='OrganizationalUnits'";
        var finalResult = simpleDBQuery(query)
        .then( groupData =>{
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
            query = "Select id,name,term,phone, email, office from GroupMembers where pageLink='" + groupDataWithPageText.link +"' ";
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

module.exports =  {router, handleDisconnect};

var knexConfig = require('../knexfile.js')
var knexConnection = require('knex')(knexConfig['development']);

const updates = [
    // {groupName:'Assessing',
    // data:{address: 'PO Box 310\nMilton, NH 03851', emailAddress: 'assessing@miltonnh-us.com', phone: '(603) 652-4501 x6', fax: '(603) 652-4120',
    // hours: 'Monday through Friday 8:00 a.m. - 4:00 p.m.'}
    // },
    // {groupName:'CodeEnforcement',
    // data:{emailAddress: 'CodeEnforcement@miltonnh-us.com', phone: '(603) 652-4501 x7', fax: '(603) 652-4120',
    //         hours: 'Tuesday & Wednesday 8:00 a.m. - 4:00 p.m.'}
    // },
    // {groupName:'ParksRecreation',
    // data:{emailAddress: 'recreation@miltonnh-us.com', phone: '(603) 652-4501 x8', phone2: '(603) 834-0279', fax: '(603) 652-4120',
    // address: 'P.O Box 310\nMilton, NH 03851'
    // }},
    // {groupName:'Sewer',
    // data:{emailAddress: 'Sewer@miltonnh-us.com', phone: '(603) 652-4501 x5', fax: '(603) 652-4120'}},
    // {groupName:'TownClerk',
    // data:{emailAddress: 'townclerktaxcollector@miltonnh-us.com', phone: '(603) 652-4501 x4', fax: '(603) 652-4120',
    // hours: 'Mon, Tues, Wed, Fri\n8:30am-4:00pm\nThurs - 8:30am-6:30pm \nLast Sat of the Month\n8am-12pm\nExcept Holiday weekends',
    // address: 'P.O Box 180\n424 White Mountain HWY\nMilton, NH 03851'
    // }},
    // {groupName:'Welfare',
    // data:{ phone: '(603) 652-4501 x6', fax: '(603) 652-4120',
    // hours: 'By appointment only',
    // address: '424 White Mountain HWY\nMilton, NH 03851'
    // }},
]

const groupNameUpdate = (knex, name, update) => knex('Groups').where({groupName:name}).update(update);
const bulkGroupUpdate  = (knex, updates) => updates.map( update => groupNameUpdate(knex , update.groupName, update.data))

exports.seed = function(knex, Promise) {
  return  Promise.all(bulkGroupUpdate(knex, updates))
  // groupNameUpdate( knex,
  //         'Assessing', {address: 'PO Box 310 Milton, NH 03851',emailAddress: 'assessing@miltonnh-us.com',
  //         phone: '(603) 652-4501 x6', fax: '(603) 652-4120'}
  //     )
};


if (require.main === module) {
    Promise.all(bulkGroupUpdate(knexConnection, updates))
    .then(result => {
        // console.log('results:',result);
        process.exit()
    })
}

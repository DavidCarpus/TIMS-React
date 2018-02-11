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
//================================================
function pullMenusFromDB(dbConn) {
    return dbConn('Menus')
    .select('*')
    .then(data =>
        data.reduce( (acc, curr, i) => {
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
    )
}
//================================================
if (require.main === module) {
    var knexConfig = require('../server/libs/db/knexfile.js')
    var knex = require('knex')(knexConfig[ process.env.NODE_ENV || 'development']);

    pullMenusFromDB(knex)
    .then( (results) => {
        console.log('results', require('util').inspect(results, { depth: null }));
    })
    .then( ()=>process.exit() )
}
//================================================
module.exports.pullMenusFromDB = pullMenusFromDB;

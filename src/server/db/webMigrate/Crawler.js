const crc = require('crc');
const cheerio = require('cheerio')

var cachingFetchURL = require('./serverIO').cachingFetchURL;

const pathWithoutFilename = (path) => path.substr(0, path.lastIndexOf('/'))
const onlyFileName = (fullPath) => fullPath.replace(/.*\//, '')

function linksFromPage(pageURI, pageData) {
    // console.log('linksFromPage', pageURI, pageData.length);

    var $ = cheerio.load(pageData);
    const allAnchors = $(pageData).find('.innerCent').find('a').filter( (i,el) => $(el).attr('href'))
    return $(allAnchors)
    .filter( (i,el) => ! $(el).text().startsWith('Printer-Friendly') )
    // .filter( (i,el) => $(el).attr('href').indexOf('Lower=21') === -1 )
    // .filter( (i,el) => $(el).attr('href').indexOf('Upper=') === -1 )
    .map((linkIndex, link) => {
        let href = $(link).attr('href')
        const uri=pathWithoutFilename(pageURI) + '/'
        const fn = onlyFileName(href)
        if (uri.startsWith('file') && href.indexOf('http') >= 0) {
            // return uri+fn
            // console.log('***' +uri + fn);
            return null
        }
        // console.log('*' +uri + href);
        return uri + href
    }).toArray()
    .filter(lnk=> lnk !== null)

}

// let visited = {}
class Crawler {
    // let visited = {}
    constructor(){
        // console.log('Reset visited', Object.keys(visited).length);
        this.visited = {}
    }
    crawl(options, parentURI, uri){
        // console.log('visited', Object.keys(this.visited).length);
        return crawlFunc(this.visited, options, parentURI, uri)
    }
}

const crawlFunc = function (visited, options, parentURI, pageURI) {
    // console.log('crawlFunc', pageURI);
    if(options.noMailLinks && pageURI.indexOf("mailto:") >=0 ) return Promise.resolve([])

    return cachingFetchURL(pageURI)
        .then(fetchedData => {
            const contentType = fetchedData.contentType
            const contentCRC = crc.crc32( pageURI ).toString(16)
            if (Object.keys(visited).includes(contentCRC)) {
                return Promise.resolve(null)
            }
            if (contentType === 'text/html') {
                visited[contentCRC] = {contentType:contentType, uri:pageURI, parentURI:parentURI, uriCRC:contentCRC}
                const links = linksFromPage(pageURI, fetchedData.data)
                // .filter(link=> link !== pageURI )
                .filter(link=> link !== pageURI &&
                    options.uriOnlyFilter?link.indexOf(options.uriOnlyFilter) >=0 : true &&
                    options.noMailLinks?link.indexOf("mailto:") >=0 : true
                )

                return Promise.all(links.map(lnk => crawlFunc(visited, options, pageURI, lnk)))
                .then(subLinks => {
                    return Promise.resolve(subLinks)
                })
            } else {
                return Promise.resolve(
                    visited[contentCRC] = {contentType:contentType, uri:pageURI, parentURI:parentURI, uriCRC:contentCRC}
                )
            }
        })
        .then(done=> Promise.resolve(Object.keys(visited).map(key => visited[key] )))
};

module.exports.Crawler = Crawler


/*
const sequence = function() {
  return [].reduce.call(arguments, function(comp, fn) {
    return () => comp(fn.apply(null, arguments));
  });
};

const sequence = function(...fns) {
  return fns.reduce(function(comp, fn) {
    return (...args) => comp(fn.apply(null, args));
  });
};
*/

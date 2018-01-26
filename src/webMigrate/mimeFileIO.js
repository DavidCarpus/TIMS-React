var mmm = require('mmmagic'),
    Magic = mmm.Magic;

function getMimeType(uri) {
        var magic = new Magic(mmm.MAGIC_MIME_TYPE);
        return new Promise(function(resolve, reject) {
            magic.detectFile(uri, function(err, result) {
                if (err) reject(err);
                // console.log('mimeType', result);
                resolve(result)
            });
        });
    }

module.exports = {
    getMimeType:getMimeType
}

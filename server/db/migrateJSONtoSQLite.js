var fs = require('fs');
var path = require('path');
var tmp = require('tmp');
var sqlite3 = require('sqlite3').verbose();

const DEFAULT_JSON_DIR='/home/dcarpus/code/milton_nh/react_miltonNH/api/db/';
const DEFAULT_DB_PATH='/home/dcarpus/code/milton_nh/react_miltonNH/api/db/phpsqlite.db';

var JSON_DIR=DEFAULT_JSON_DIR;
var DB_PATH=DEFAULT_DB_PATH;

var db = null;

var processJSONFile = function(jsonFile) {
    if (db == null) {
        db = new sqlite3.Database(DB_PATH);
    }
    var filename = jsonFile.replace(/^.*[\\\/]/, '');
    filename = filename.replace('.json', '')
    db.serialize(function() {
        db.run('CREATE TABLE if not exists ' + filename + ' (info TEXT)');
        // var stmt = db.prepare("INSERT INTO user_info VALUES (?)");
        // for (var i = 0; i < 10; i++) {
        //     stmt.run("Ipsum " + i);
        // }
        // stmt.finalize();

        // db.each("SELECT rowid AS id, info FROM user_info", function(err, row) {
        //     console.log(row.id + ": " + row.info);
        // });
        console.log('\n *FILE: ' + filename);
        var content = fs.readFileSync(jsonFile);
        var jsonContent = JSON.parse(content);
        // console.log("Output Content : \n"+ Object.keys(jsonContent));
        for(var exKey in jsonContent) {
            console.log('key:'+exKey+', value:'+jsonContent[exKey]);
        }
    });
}

// console.log("FILE:" + file);


fs.readdir(JSON_DIR, function(err, list) {
    if (err){
        console.log(err);
        return err;
    }
    list.forEach(function(file) {
        file = path.resolve(JSON_DIR, file);
        fs.stat(file, function(err, stat) {
            if (stat && stat.isFile() && file.endsWith('.json')) {
                processJSONFile(file);
            }
        })
    })
})

// print process.argv
// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });

if (process.argv.length >= 3 ) {
    const index=2;
    console.log(index + ': ' + process.argv[index]);
    JSON_DIR = process.argv[index];
    DB_PATH=JSON_DIR + 'phpsqlite.db';
}

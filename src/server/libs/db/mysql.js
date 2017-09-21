var Config = require('../../config'),
configuration = new Config();

var knexConfig = require('./knexfile.js')
var knex = require('knex')(knexConfig[configuration.mode]);

var mysql = require('mysql');

const poolConfig = {
  connectionLimit : 10,
  host            : configuration.db_config.host,
  user            : configuration.db_config.user,
  password        : configuration.db_config.password,
  database        : configuration.db_config.database,
}

var mysql_pool  = mysql.createPool(poolConfig);


exports.mysql_pool = mysql_pool;
exports.knex = knex;

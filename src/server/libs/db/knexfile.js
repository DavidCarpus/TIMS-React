let mode=process.env.INIT_MODE || process.env.NODE_ENV||'development'
const privateDir = mode === 'development'  || process.env.DEV_MACHINE ? '../../../private/'+process.env.REACT_APP_MUNICIPALITY: '../../../private/'
const credentialsDir = mode === 'development' || process.env.DEV_MACHINE ? '../../../../credentials/'+process.env.REACT_APP_MUNICIPALITY: '../../../credentials/'

console.log('process.env.INIT_MODE:', process.env.INIT_MODE);

var dev_credentials = require(credentialsDir +'/configuration_dev.json');
var prod_credentials = require(credentialsDir +'/configuration_prod.json');
var test_credentials = require(credentialsDir +'/configuration_test.json');

module.exports = {
    development: {
      client: 'mysql',
      connection: dev_credentials.db_config ,
      pool: { min: 0, max: 7 },
      useNullAsDefault: true
  },
  production: {
    client: 'mysql',
    connection: prod_credentials.db_config ,
    pool: { min: 0, max: 7 },
    useNullAsDefault: true
},
  test: {
    client: 'mysql',
    connection: test_credentials.db_config ,
    pool: { min: 0, max: 7 },
    useNullAsDefault: true
  }
}

let mode=process.env.INIT_MODE || process.env.NODE_ENV||'development'
const privateDir = mode === 'development'  || process.env.DEV_MACHINE ? '../../../private/'+process.env.REACT_APP_MUNICIPALITY: '../../../private/'

console.log('process.env.INIT_MODE:', process.env.INIT_MODE);

var configuration_dev = require(privateDir+'/configuration_dev.json');
var configuration_prod = require(privateDir+'/configuration_prod.json');
var configuration_test = require(privateDir+'/configuration_test.json');

module.exports = {
    development: {
      client: 'mysql',
      connection: configuration_dev.db_config ,
      pool: { min: 0, max: 7 },
      useNullAsDefault: true
  },
  production: {
    client: 'mysql',
    connection: configuration_prod.db_config ,
    pool: { min: 0, max: 7 },
    useNullAsDefault: true
},
  test: {
    client: 'mysql',
    connection: configuration_test.db_config ,
    pool: { min: 0, max: 7 },
    useNullAsDefault: true
  }
}

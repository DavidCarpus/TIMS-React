let mode=process.env.NODE_ENV||'development'
const privateDir = mode === 'development' ? '../../../private/'+process.env.REACT_APP_MUNICIPALITY: '../../../private/'

var configuration_dev = require(privateDir+'/configuration_dev.json');
var configuration_prod = require(privateDir+'/configuration_prod.json');
var configuration_test = require(privateDir+'/configuration_test.json');

module.exports = {
    development: {
      client: 'mysql',
      connection: configuration_dev.db_config ,
      useNullAsDefault: true
  },
  production: {
    client: 'mysql',
    connection: configuration_prod.db_config ,
    useNullAsDefault: true
},
  test: {
    client: 'mysql',
    connection: configuration_test.db_config ,
    useNullAsDefault: true
  }
}

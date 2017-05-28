var configuration_dev = require('./private/configuration_dev.json');
var configuration_prod = require('./private/configuration_prod.json');

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
    }
}

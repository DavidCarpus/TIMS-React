var dev_configuration = require('./private/configuration_dev.json');
var prod_configuration = require('./private/configuration_prod.json');
var test_configuration = require('./private/configuration_test.json');

module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return dev_configuration;
        case 'production':
            return prod_configuration;
        case 'test':
            return test_configuration;
        default:
            return dev_configuration;
    }
};

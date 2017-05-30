var dev_configuration = require('./private/configuration_dev.json');
var prod_configuration = require('./private/configuration_prod.json');
var test_configuration = require('./private/configuration_test.json');

let mode=process.env.NODE_ENV||'development'
module.exports = function(){
    console.log('Mode:' + mode);
    switch(mode){
        case 'development':
            return dev_configuration;
        case 'production':
            return prod_configuration;
        case 'test':
            return test_configuration;
        // default:
        //     return dev_configuration;
    }
};

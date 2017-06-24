var dev_configuration = require('./private/configuration_dev.json');
var prod_configuration = require('./private/configuration_prod.json');
var test_configuration = require('./private/configuration_test.json');

let mode=process.env.NODE_ENV||'development'
module.exports = function(){
    // console.log('Mode:' + mode);
    switch(mode){
        case 'development':
            // return dev_configuration;
            return Object.assign({}, dev_configuration, {mode: mode, ATTACHMENT_DIR:__dirname + '/private/Attachments/'});
        case 'production':
        // return prod_configuration;
            return Object.assign({}, prod_configuration, {mode: mode, ATTACHMENT_DIR:__dirname + '/private/Attachments/'});
        case 'test':
        // return test_configuration;
            return Object.assign({}, test_configuration, {mode: mode, ATTACHMENT_DIR:__dirname + '/private/Attachments/'});
        // default:
        //     return dev_configuration;
    }
};

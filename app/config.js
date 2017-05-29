var dev_configuration = require('json!../nodeapi/private/configuration_dev.json');
var prod_configuration = require('json!../nodeapi/private/configuration_prod.json');
var test_configuration = require('json!../nodeapi/private/configuration_test.json');

// const ROOT_URL = location.href.indexOf('localhost') > 0 ? configuration.ui.ROOT_URL : './api/';

let currEnv = process.env.NODE_ENV;

if (location.href.indexOf('localhost') > 0) {      currEnv = 'development' }
if (location.href.indexOf('miltonDev') > 0) {      currEnv = 'test' }

// var dev_configuration = {'ui':{
//     'ROOT_URL':'http://localhost:45000/api/'
// }}
// const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : '/';
// const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : 'http://www.carpusconsulting.com/milton/api/';

module.exports = function(){
    switch(currEnv){
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

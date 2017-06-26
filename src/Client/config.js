var dev_configuration = require('privateConfig/configuration_dev.json');
var prod_configuration = require('privateConfig/configuration_prod.json');
var test_configuration = require('privateConfig/configuration_test.json');


let currEnv = process.env.NODE_ENV;

// if (location.href.indexOf('localhost') > 0) {      currEnv = 'development' }
 if (location.href.indexOf('test.miltonnh') > 0) {      currEnv = 'test' } // eslint-disable-line no-restricted-globals

// var dev_configuration = {'ui':{
//     'ROOT_URL':'http://localhost:45000/api/'
// }}
// const ROOT_URL = location.href.indexOf('localhost') > 0 ? configuration.ui.ROOT_URL : './api/';
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

// const MUNICIPALITY='MiltonNH'
const MUNICIPALITY=process.env.REACT_APP_MUNICIPALITY || 'NewDurhamNH'

// $REACT_APP_MUNICIPALITY
var dev_configuration = require('../private/' + MUNICIPALITY + '/configuration_dev.json');
var prod_configuration = require('../private/' + MUNICIPALITY + '/configuration_prod.json');
var test_configuration = require('../private/' + MUNICIPALITY + '/configuration_test.json');
var base_configuration = require('../private/' + MUNICIPALITY + '/configuration.json');

if (!String.prototype.startsWith) {
    // eslint-disable-next-line
    String.prototype.startsWith = function(searchString, position){
      return this.substr(position || 0, searchString.length) === searchString;
  };
}
//======================================
//======================================
// https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
//======================================
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

//======================================
/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
 function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
//======================================
//======================================

//======================================
let mode=process.env.BUILD_MODE || process.env.NODE_ENV || 'production'
// mode='test'
if(window.location.hostname.startsWith('test') || window.location.hostname.startsWith('color')) {
    mode='test'
}


module.exports = function(){
    let mergedConf = mergeDeep({}, base_configuration);
    mergedConf = mergeDeep(mergedConf,
        {mode: mode, ATTACHMENT_DIR:__dirname +  mergedConf.attachmentPath }
    );

    switch(mode){
        case 'development':
            mergedConf = mergeDeep(mergedConf, dev_configuration );
            break;
        case 'production':
            mergedConf = mergeDeep(mergedConf, prod_configuration );
            break;
        case 'test':
            mergedConf = mergeDeep(mergedConf, test_configuration );
            break;
        default:
            return mergedConf;
    }
    // console.log('process.env.BUILD_MODE:', process.env.BUILD_MODE);
    // console.log('mergedConf:',mergedConf );
    return mergedConf;
};

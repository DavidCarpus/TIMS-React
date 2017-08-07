var dev_configuration = require('privateConfig/configuration_dev.json');
var prod_configuration = require('privateConfig/configuration_prod.json');
var test_configuration = require('privateConfig/configuration_test.json');
var base_configuration = require('privateConfig/configuration.json');
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

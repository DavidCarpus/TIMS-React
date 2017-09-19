var base_configuration = require('../private/configuration.json');
var dev_configuration = require('../private/configuration_dev.json');
var prod_configuration = require('../private/configuration_prod.json');
var test_configuration = require('../private/configuration_test.json');

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
let mode=process.env.NODE_ENV||'development'
// mode='test'
// console.log(__dirname);

module.exports = function(){
    let mergedConf = mergeDeep({}, base_configuration);
    mergedConf = mergeDeep(mergedConf,
        {mode: mode, ATTACHMENT_DIR:__dirname +  mergedConf.attachmentPath, ROOT_DIR: __dirname }
    );

    switch(mode){
        case 'development':
            // console.log(mergeDeep(mergedConf, dev_configuration ));
            return mergeDeep(mergedConf, dev_configuration );
        case 'production':
            return mergeDeep(mergedConf, prod_configuration );
        case 'test':
            return mergeDeep(mergedConf, test_configuration );
        // default:
        //     return dev_configuration;
    }
};

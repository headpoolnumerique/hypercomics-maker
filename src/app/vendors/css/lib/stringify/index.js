
/**
 * Module dependencies.
 */


// var Compressed = require('./compress');
import Compressed from "./compress"


// var Identity = require('./identity');
import Identity from "./identity"

/**
 * Stringfy the given AST `node`.
 *
 * Options:
 *
 *  - `compress` space-optimized output
 *  - `sourcemap` return an object with `.code` and `.map`
 *
 * @param {Object} node
 * @param {Object} [options]
 * @return {String}
 * @api public
 */

export default function(node, options) {
  options = options || {};

  var compiler = options.compress
    ? new Compressed(options)
    : new Identity(options);

  // the sourcemap break node
  // source maps
  // if (options.sourcemap) {
  //   var sourcemaps = require('./source-map-support');
  //   sourcemaps(compiler);
  //
  //   var code = compiler.compile(node);
  //   compiler.applySourceMaps();
  //
  //   var map = options.sourcemap === 'generator'
  //     ? compiler.map
  //     : compiler.map.toJSON();
  //
  //   return { code: code, map: map };
  // }

  var code = compiler.compile(node);
  return code;
};

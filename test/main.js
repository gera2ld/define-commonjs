define('a', function (require, exports, module) {
  module.exports = 'Hello';
});

define('b', function (require, exports, module) {
  module.exports = 'world';
});

define('c', function (require, exports, module) {
  var d = require('d');
  exports.name = 'c' + (d.name || '-');
});

define('d', function (require, exports, module) {
  var c = require('c');
  exports.name = 'd' + (c.name || '-');
});

define('main', function (require, exports, module) {
  var a = require('a');
  var b = require('b');
  var c = require('c');
  var d = require('d');
  document.getElementById('output').innerHTML = a + ' ' + b + '!' + ' ' + c.name + ' ' + d.name;
});

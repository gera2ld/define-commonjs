define('a', function (require, exports, module) {
  module.exports = 'Hello';
});

define('b', function (require, exports, module) {
  module.exports = 'world';
});

define('main', function (require, exports, module) {
  var a = require('a');
  var b = require('b');
  document.getElementById('output').innerHTML = a + ' ' + b + '!';
});

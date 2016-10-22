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

define.use('main');

define.async('async/a', function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(`module.exports = ${Date.now()}`);
    }, 1000);
  });
});
define.async('async/b', function () {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(`module.exports = ${Date.now()}`);
    }, 2000);
  });
});
define.async('async/main', function () {
  return `
  var a = require('async/a');
  var b = require('async/b');
  document.getElementById('output').innerHTML += '<hr>async/main: ' + (b - a);
  `;
});

define.use('async/main');
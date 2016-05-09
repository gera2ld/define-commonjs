Require Lite
===

This is a super lite CMD-oid implementation.

Usage
---
``` html
<script src="require-lite.js"></script>
<script src="bundle.js"></script>
<script>
define.use('main');
</script>
```

``` js
// bundle.js consists of a bunch of factories

define('a', function (require, exports, module) {
  module.exports = 'Hello';
});

define('b', function (require, exports, module) {
  module.exports = 'world';
});

define('main', function (require, exports, module) {
  var a = require('a');
  var b = require('b');
  console.log(a + ' ' + b + '!');
});
```

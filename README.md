define-commonjs
===

![NPM](https://img.shields.io/npm/v/define-commonjs.svg)
![Licence](https://img.shields.io/npm/l/define-commonjs.svg)
![Downloads](https://img.shields.io/npm/dt/define-commonjs.svg)

This is yet another CommonJS implementation.

Usage
---
``` html
<script src="define.js"></script>
<script src="bundle.js"></script>
```

``` js
// bundle.js is like this
define('a', function (require, exports, module) {
  module.exports = 'hello';
});

define('b', function (require, exports, module) {
  module.exports = 'world';
});

define('app', function (require, exports, module) {
  var a = require('a');
  var b = require('b');
  console.log(a + ', ' + b);
});

define.use('app');
```

Packing
---
Assume we have a project with three files:

``` js
// src/a.js
module.exports = 'hello';

// src/b.js
module.exports = 'world';

// src/app.js
var a = require('./a');
var b = require('./b');
console.log(a + ', ' + b);
```

Using gulp:
``` js
const pack = require('define-commonjs/pack/gulp');
const concat = require('gulp-concat');

gulp.task('pack', () => {
  const collect = pack();
  return gulp.src('src/*.js')
  .pipe(collect)
  .pipe(collect.pack('src/app.js'))
  .pipe(concat())
  .pipe(gulp.dest('dist'));
});

gulp.task('pack-with-custom-paths', () => {
  const collect = pack();
  return gulp.src('src/*.js')
  .pipe(collect)
  .pipe(collect.pack('src/app.js', file => {
    // This is useful if we have changed files before packing, e.g. concat'ed.
    return file.relative === 'main.js' ? 'src/app.js' : file.path;
  }))
  .pipe(concat())
  .pipe(gulp.dest('dist'));
});
```

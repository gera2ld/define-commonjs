define.js
===

This is a super lite CommonJS implementation.

Usage
---
``` html
<script src="define.js"></script>
<script src="bundle.js"></script>
```

``` js
// bundle.js
define('a', function (require, exports, module) {
  module.exports = 'Hello';
});

define('b', function (require, exports, module) {
  module.exports = 'world';
});

define('app', function (require, exports, module) {
  var a = require('a');
  var b = require('b');
  console.log(a + ' ' + b + '!');
});

define.use('app');
```

Packing
---
Using gulp:
``` js
const pack = require('define/pack/gulp');
const concat = require('gulp-concat');

gulp.task('pack', () => {
  const collect = pack();
  return gulp.src('src/**/*.js')
  .pipe(collect)
  .pipe(collect.pack('src/app.js'))
  .pipe(concat())
  .pipe(gulp.dest('dist'));
});

gulp.task('pack-with-custom-paths', () => {
  const collect = pack();
  return gulp.src('src/**/*.js')
  .pipe(collect)
  .pipe(collect.pack('src/app.js', file => {
    return file.relative === 'main.js' ? 'src/app.js' : file.path;
  }))
  .pipe(concat())
  .pipe(gulp.dest('dist'));
});
```

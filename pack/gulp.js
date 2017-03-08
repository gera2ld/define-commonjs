const path = require('path');
const gutil = require('gulp-util');
const through = require('through2');
const pack = require('.');

function packPlugin(deps, options) {
  function bufferContents(file, enc, cb) {
    if (file.isNull()) return cb();
    if (file.isStream()) return this.emit('error', new gutil.PluginError('define.js', 'Stream is not supported.'));
    const {getPath} = options;
    const filepath = getPath && getPath(file) || file.path;
    file.contents = new Buffer(pack.wrap(deps, String(file.contents), filepath, options));
    cb(null, file);
  }

  function endStream(cb) {
    let {main} = options;
    if (main) {
      if (typeof main === 'string') main = {
        path: main,
        name: path.basename(main),
      };
      this.push(new gutil.File({
        base: '',
        path: main.name || 'app.js',
        contents: new Buffer(pack.use(deps, main.path)),
      }));
    }
    cb();
  }

  return through.obj(bufferContents, endStream);
}

function collectPlugin(options) {
  function bufferContents(file, enc, cb) {
    if (file.isNull()) return cb();
    if (file.isStream()) return this.emit('error', new gutil.PluginError('define.js', 'Stream is not supported.'));
    items.push(pack.collect(String(file.contents), file.path, options));
    cb(null, file);
  }

  function endStream(cb) {
    Promise.all(items)
    .then(collection => pack.loadDeps(collection, options))
    .then(deps => {
      this.pack = packOptions => packPlugin(deps, Object.assign({}, options, packOptions));
      cb();
    })
    .catch(err => {
      console.error(err);
      throw err;
    });
  }

  const items = [];

  return through.obj(bufferContents, endStream);
}

module.exports = collectPlugin;

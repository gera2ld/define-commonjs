const path = require('path');
const gutil = require('gulp-util');
const through = require('through2');
const pack = require('.');

function packPlugin(deps, main, getPath) {
  function bufferContents(file, enc, cb) {
    if (file.isNull()) return cb();
    if (file.isStream()) return this.emit('error', new gutil.PluginError('define.js', 'Stream is not supported.'));
    const filepath = getPath && getPath(file) || file.path;
    file.contents = new Buffer(pack.wrap(deps, String(file.contents), filepath));
    cb(null, file);
  }

  function endStream(cb) {
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

function collectPlugin() {
  function bufferContents(file, enc, cb) {
    if (file.isNull()) return cb();
    if (file.isStream()) return this.emit('error', new gutil.PluginError('define.js', 'Stream is not supported.'));
    items.push(pack.collectOne(String(file.contents), file.path));
    cb(null, file);
  }

  function endStream(cb) {
    Promise.all(items)
    .then(pack.loadDeps)
    .then(deps => {
      this.pack = (...args) => packPlugin(deps, ...args);
    })
    .then(() => cb());
  }

  const items = [];

  return through.obj(bufferContents, endStream);
}

module.exports = collectPlugin;

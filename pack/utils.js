const path = require('path');

function promisify(func, ...partialArgs) {
  return (...args) => new Promise((resolve, reject) => {
    func(...args, ...partialArgs, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
}

function resolvePath(filepath, base, options) {
  if (base && /^\.\.?(\/|$)/.test(filepath)) {
    filepath = path.join(base, filepath);
  }
  filepath = path.normalize(filepath).replace(/\\/g, '/');
  if (path.isAbsolute(filepath)) return filepath;
  options && options.alias && Object.keys(options.alias).some(key => {
    if (filepath === key || filepath.startsWith(`${key}/`)) {
      filepath = options.alias[key] + filepath.slice(key.length);
      return true;
    }
  });
  return path.resolve(filepath);
}

exports.promisify = promisify;
exports.resolvePath = resolvePath;

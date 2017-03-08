const fs = require('fs');
const path = require('path');
const {promisify, resolvePath} = require('./utils');
const stat = promisify(fs.stat);
const glob = require('glob');
const globPromise = promisify(glob);

function getRERequireRelative() {
  // return a new RegExp every time
  return /\brequire\(['"](\.[^'"]*)['"]\)/g;
}

function mergeListMap(...maps) {
  function merge(item) {
    Array.isArray(item)
    ? item.forEach(merge)
    : Object.keys(item).forEach(key => {
      const origin = map[key];
      const value = item[key];
      map[key] = origin ? origin.concat(value) : value;
    });
  }
  const map = {};
  merge(maps);
  return map;
}

function resolveFile(file, options) {
  return stat(file)
  .then(res => {
    if (res.isFile()) return file;
    if (res.isDirectory() && options.tryDir) {
      return resolveFile(
        path.join(file, 'index'),
        Object.assign({}, options, {tryDir: false})
      );
    }
    return Promise.reject();
  }, err => options.ext.reduce((res, ext) => res.catch(() => {
    const filepath = file + ext;
    return stat(filepath).then(() => filepath);
  }), Promise.reject()))
  .catch(err => {
    throw file;
  });
}

const defaultOptions = {
  tryDir: true,
  ext: ['.js'],
};

function collect(content, filepath, options) {
  const fullpath = resolvePath(filepath, options);
  const dir = path.dirname(filepath);
  const re = getRERequireRelative();
  const depMap = {};
  const list = depMap[fullpath] = depMap[fullpath] || [];
  list.push({
    filepath,
  });
  for (let m; m = re.exec(content);) {
    const fullpath = resolvePath(path.join(dir, m[1]), options);
    const list = depMap[fullpath] = depMap[fullpath] || [];;
    list.push({
      filepath,
    });
  }
  return depMap;
}

function loadDeps(collection, options) {
  const depMap = mergeListMap(collection);
  return Promise.all(Object.keys(depMap).map(key => {
    const data = depMap[key];
    return resolveFile(key, defaultOptions)
    .then(fullpath => ({key, fullpath, data}));
  }))
  .catch(dep => {
    throw new Error(`\
Dependency not found: ${dep}
Required by:
${depMap[dep].map(item => '- ' + item.filepath).join('\n')}`);
  })
  .then(res => {
    const nameMap = res.reduce((map, item) => {
      map[item.key] = item.fullpath;
      return map;
    }, {});
    const dataMap = mergeListMap(res.map(item => ({
      [item.fullpath]: item.data,
    })));
    Object.keys(dataMap).sort()
    .forEach((key, i) => {
      dataMap[key].id = i + 1;
    });
    return {nameMap, dataMap};
  })
  .catch(err => {
    console.error(err);
    throw err;
  });
}

function getModuleId(deps, ...paths) {
  const dep = path.resolve(...paths);
  const name = deps.nameMap[dep] || dep;
  const item = deps.dataMap[name];
  if (!item) throw new Error(`Dependency not found: ${dep}`);
  return item.id;
}

function wrap(deps, content, filepath) {
  const re = getRERequireRelative();
  const id = getModuleId(deps, filepath);
  const dirname = path.dirname(filepath);
  content = content.replace(re, (m, dep) => `require(${JSON.stringify(getModuleId(deps, dirname, dep))})`);
  return `\
define(${JSON.stringify(id)}, function (require, exports, module) {
${content}
});
`;
}

function use(deps, ...filepaths) {
  const ids = filepaths.map(filepath => getModuleId(deps, filepath));
  return `define.use(${JSON.stringify(ids)});\n`;
}

function getFiles(pattern, options={}) {
  options.nodir = true;
  return globPromise(pattern, options);
}

exports.glob = getFiles;
exports.collect = collect;
exports.loadDeps = loadDeps;
exports.wrap = wrap;
exports.use = use;

const fs = require('fs');
const {collect, loadDeps} = require('.');
const {promisify} = require('./utils');
const readFile = promisify(fs.readFile, 'utf8');

function collectList(files) {
  return Promise.all(files.map(file => (
    readFile(file).then(content => collect(content, file))
  )))
  .then(loadDeps);
}

exports.readFile = readFile;
exports.collectList = collectList;

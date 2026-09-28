'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

exports.load = (file, mocks = {}, platform = process.platform) => {
  if (mocks.vscode) {
    mocks.vscode = Object.assign({ workspace: { getConfiguration: () => ({ get: (key, fallback) => fallback }) } }, mocks.vscode);
  }
  const module = { exports: {} };
  const filename = path.resolve(__dirname, '../out', file + '.js');
  const sandbox = {
    module, exports: module.exports, console: mocks.console || console, Buffer,
    process: { platform, env: process.env },
    require: name => Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : require(name.startsWith('.') ? path.resolve(path.dirname(filename), name) : name)
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), sandbox, { filename });
  return module.exports;
};

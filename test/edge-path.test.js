const assert = require('assert');
const { load } = require('./helpers');
module.exports = async () => {
  for (const file of ['C:\\Test Folder\\index.html', 'C:\\OneDrive - Personal\\html & css\\a#b.html']) {
    const uri = 'file:///C:/' + file.slice(3).split('\\').map(encodeURIComponent).join('/');
    const calls = [];
    const util = load('util', {
      './config': load('config', {}, 'win32'),
      './windows': { openWindows: (target, browser) => { calls.push([target, browser]); return Promise.resolve(); } },
      vscode: { Uri: { file: input => { assert.strictEqual(input, file); return { toString: () => uri }; } } }
    }, 'win32');
    assert.strictEqual(util.standardizedBrowserName('edge'), 'msedge');
    await util.open(file, util.standardizedBrowserName('edge'));
    await util.open(file);
    assert.deepStrictEqual(calls, [[uri, 'msedge'], [file, '']]);
  }
};

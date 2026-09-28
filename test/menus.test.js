const assert = require('assert');
const manifest = require('../package.json');
module.exports = () => {
  for (const menu of ['explorer/context', 'editor/context', 'editor/title/context']) {
    const entries = manifest.contributes.menus[menu];
    const defaultItem = entries.find(item => item.command === 'extension.openInDefaultBrowser');
    assert.strictEqual(defaultItem.when, 'resourceScheme == file && explorerResourceIsFolder != true');
    assert.strictEqual(entries.find(item => item.command === 'extension.openInSpecifyBrowser').when, 'resourceLangId == html');
  }
};

const assert = require('assert');
const manifest = require('../package.json');
module.exports = () => {
  for (const menu of ['explorer/context', 'editor/context', 'editor/title/context']) {
    const entries = manifest.contributes.menus[menu];
    const defaultItem = entries.find(item => item.command === 'extension.openInDefaultBrowser');
    assert.strictEqual(defaultItem.when, 'resourceScheme == file && explorerResourceIsFolder != true');
    assert.strictEqual(entries.find(item => item.command === 'extension.openInSpecifyBrowser').when, 'resourceLangId == html');
    // Truth table for the declared context expression, including non-HTML files.
    const visible = (scheme, folder) => scheme === 'file' && folder !== true;
    for (const extension of ['html', 'json', 'xml', 'md', 'psd']) assert.ok(visible('file', false), extension);
    assert.ok(!visible('file', true));
    for (const scheme of ['untitled', 'vscode-remote', 'git']) assert.ok(!visible(scheme, false));
  }
};

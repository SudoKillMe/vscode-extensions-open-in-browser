const assert = require('assert');
const { load } = require('./helpers');
module.exports = () => {
  const browsers = load('config', {}, 'darwin').default.browsers;
  assert.strictEqual(browsers.find(b => b.acceptName.includes('fde')).standardName, 'Firefox Developer Edition');
};

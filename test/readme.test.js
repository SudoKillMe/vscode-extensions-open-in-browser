const assert = require('assert');
const fs = require('fs');
const manifest = require('../package.json');
module.exports = () => {
  const readme = fs.readFileSync(require('path').join(__dirname, '../README.md'), 'utf8');
  const blocks = [...readme.matchAll(/```json\n([\s\S]*?)\n```/g)].map(match => JSON.parse(match[1]));
  assert.ok(blocks.length >= 4);
  for (const block of blocks) {
    if (Array.isArray(block)) {
      for (const binding of block) assert.ok(manifest.contributes.commands.some(command => command.command === binding.command.replace(/^-/, '')));
    } else {
      for (const key of Object.keys(block)) assert.ok(manifest.contributes.configuration.properties[key], key);
    }
  }
};

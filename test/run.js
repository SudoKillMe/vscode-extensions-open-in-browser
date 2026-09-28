'use strict';
const fs = require('fs');
const path = require('path');
(async () => {
  for (const file of fs.readdirSync(__dirname).filter(name => name.endsWith('.test.js')).sort()) {
    await require(path.join(__dirname, file))();
    console.log('PASS ' + file);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

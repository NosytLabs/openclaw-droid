const test = require('node:test');
const assert = require('node:assert');
const os = require('os');

test('hijack.js modifies os.networkInterfaces to return an empty object', () => {
  require('./hijack.js');
  const after = os.networkInterfaces();
  assert.deepStrictEqual(after, {});
});

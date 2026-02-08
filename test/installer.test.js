import { test } from 'node:test';
import assert from 'node:assert';
import esmock from 'esmock';

test('runInProot should construct command correctly', async (t) => {
  const spawnCalls = [];

  const { runInProot } = await esmock('../lib/installer.js', {
    child_process: {
      spawn: (...args) => {
        spawnCalls.push(args);
        return {
          stdout: { on: () => {} },
          stderr: { on: () => {} },
          on: () => {}
        };
      },
      execSync: () => {}
    }
  });

  const command = 'echo "hello"';
  runInProot(command);

  assert.strictEqual(spawnCalls.length, 1);
  const [cmd, args, options] = spawnCalls[0];

  assert.strictEqual(cmd, 'proot-distro');
  assert.deepStrictEqual(args, [
    'login',
    'ubuntu',
    '--',
    'bash',
    '-c',
    `export NODE_OPTIONS="--require /root/.openclaw/bionic-bypass.js" && ${command}`
  ]);
  assert.deepStrictEqual(options, { stdio: 'inherit' });
});

test('runInProotWithCallback should handle output and callback', async (t) => {
  const spawnCalls = [];
  let stdoutHandler;
  let stderrHandler;

  const { runInProotWithCallback } = await esmock('../lib/installer.js', {
    child_process: {
      spawn: (...args) => {
        spawnCalls.push(args);
        return {
          stdout: { on: (evt, handler) => { if (evt === 'data') stdoutHandler = handler; } },
          stderr: { on: (evt, handler) => { if (evt === 'data') stderrHandler = handler; } },
          on: () => {}
        };
      },
      execSync: () => {}
    }
  });

  let callbackCalled = false;
  const onFirstOutput = () => {
    callbackCalled = true;
  };

  const command = 'ls -la';

  // Mock process.stdout.write to avoid clutter
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;
  process.stdout.write = () => {};
  process.stderr.write = () => {};

  try {
    runInProotWithCallback(command, onFirstOutput);

    assert.strictEqual(spawnCalls.length, 1);
    const [cmd, args, options] = spawnCalls[0];

    assert.strictEqual(cmd, 'proot-distro');
    assert.deepStrictEqual(args, [
      'login',
      'ubuntu',
      '--',
      'bash',
      '-c',
      `export NODE_OPTIONS="--require /root/.openclaw/bionic-bypass.js" && ${command}`
    ]);
    assert.deepStrictEqual(options, { stdio: ['inherit', 'pipe', 'pipe'] });

    // Trigger output
    if (stdoutHandler) stdoutHandler(Buffer.from('output'));
    assert.strictEqual(callbackCalled, true);

    // Reset callbackCalled
    callbackCalled = false;

    // Trigger stderr output
    if (stderrHandler) stderrHandler(Buffer.from('error'));

    // callback should only be called once
    assert.strictEqual(callbackCalled, false);

  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }
});

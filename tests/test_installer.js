import { test, describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { installUbuntu } from '../lib/installer.js';

describe('installUbuntu', () => {
  it('should return true when installation succeeds', () => {
    const mockExecSync = mock.fn();
    const mockConsoleLog = mock.method(console, 'log', () => {});

    const result = installUbuntu(mockExecSync);

    assert.strictEqual(result, true);
    assert.strictEqual(mockExecSync.mock.callCount(), 1);
    assert.strictEqual(mockExecSync.mock.calls[0].arguments[0], 'proot-distro install ubuntu');

    mockConsoleLog.mock.restore();
  });

  it('should return false and log error when installation fails', () => {
    const error = new Error('Installation failed');
    const mockExecSync = mock.fn(() => { throw error; });
    const mockConsoleLog = mock.method(console, 'log', () => {});
    const mockConsoleError = mock.method(console, 'error', () => {});

    const result = installUbuntu(mockExecSync);

    assert.strictEqual(result, false);
    assert.strictEqual(mockExecSync.mock.callCount(), 1);
    assert.strictEqual(mockConsoleError.mock.callCount(), 1);

    // Check if error message is logged correctly
    const calls = mockConsoleError.mock.calls;
    assert.strictEqual(calls.length, 1);
    assert.match(calls[0].arguments[0], /Failed to install Ubuntu:/);
    assert.strictEqual(calls[0].arguments[1], 'Installation failed');

    mockConsoleLog.mock.restore();
    mockConsoleError.mock.restore();
  });
});

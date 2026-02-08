import path from 'path';
import { getBypassScriptPath } from '../lib/bionic-bypass.js';

describe('getBypassScriptPath', () => {
  const originalHome = process.env.HOME;

  afterEach(() => {
    if (originalHome !== undefined) {
      process.env.HOME = originalHome;
    } else {
      delete process.env.HOME;
    }
  });

  it('should return path based on HOME env variable', () => {
    process.env.HOME = '/test/home';
    const expected = path.join('/test/home', '.openclaw', 'bionic-bypass.js');
    expect(getBypassScriptPath()).toBe(expected);
  });

  it('should return default Termux path when HOME is undefined', () => {
    delete process.env.HOME;
    const expected = path.join('/data/data/com.termux/files/home', '.openclaw', 'bionic-bypass.js');
    expect(getBypassScriptPath()).toBe(expected);
  });
});

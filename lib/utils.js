
import fs from 'fs';
import path from 'path';

/**
 * Checks if a command exists in the system PATH.
 * @param {string} command - The command to check.
 * @returns {boolean} - True if the command exists and is executable, false otherwise.
 */
export function commandExists(command) {
  if (!command) return false;

  if (path.isAbsolute(command)) {
    try {
      fs.accessSync(command, fs.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }

  const pathEnv = process.env.PATH || '';
  const pathDirs = pathEnv.split(path.delimiter);

  const pathExt = process.platform === 'win32' ? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';') : [''];

  for (const dir of pathDirs) {
    for (const ext of pathExt) {
       const fullPath = path.join(dir, command + ext);
       if (fs.existsSync(fullPath)) {
         try {
           fs.accessSync(fullPath, fs.constants.X_OK);
           return true;
         } catch {}
       }
    }
  }
  return false;
}

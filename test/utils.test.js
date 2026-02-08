
import assert from 'assert';
import path from 'path';
import { commandExists } from '../lib/utils.js';

console.log('Running tests for commandExists...');

// Test 1: Check for a command that should exist (node)
const hasNode = commandExists('node');
console.log(`Check 'node': ${hasNode}`);
assert.ok(hasNode, 'node command should exist');

// Test 2: Check for a command that should not exist
const hasNonExistent = commandExists('non_existent_command_12345');
console.log(`Check 'non_existent_command_12345': ${hasNonExistent}`);
assert.ok(!hasNonExistent, 'non_existent_command_12345 should not exist');

// Test 3: Check for an absolute path
const nodePath = process.execPath;
const hasNodePath = commandExists(nodePath);
console.log(`Check absolute path '${nodePath}': ${hasNodePath}`);
assert.ok(hasNodePath, 'Absolute path to node executable should exist');

// Test 4: Check for absolute path that does not exist
const nonExistentPath = path.resolve('/tmp/non_existent_file_12345');
const hasNonExistentPath = commandExists(nonExistentPath);
console.log(`Check absolute path '${nonExistentPath}': ${hasNonExistentPath}`);
assert.ok(!hasNonExistentPath, 'Absolute path to non-existent file should not exist');

console.log('All tests passed!');

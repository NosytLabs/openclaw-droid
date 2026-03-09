const os = require('os');
const isTarget = process.argv.some(arg => typeof arg === 'string' && (arg.endsWith('/openclaw') || arg.endsWith('\\openclaw')));

if (process.env.OPENCLAW_BIONIC_BYPASS === '1' || isTarget) {
    process.env.OPENCLAW_BIONIC_BYPASS = '1';
    os.networkInterfaces = () => ({});
}

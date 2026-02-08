import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';

describe('installTermuxDeps', () => {
  let installTermuxDeps;
  let execSyncStub;
  let consoleLogStub;
  let consoleErrorStub;

  beforeEach(async () => {
    execSyncStub = sinon.stub();
    consoleLogStub = sinon.stub(console, 'log');
    consoleErrorStub = sinon.stub(console, 'error');

    // Import the module with mocked dependencies
    const module = await esmock('../lib/installer.js', {
      child_process: {
        execSync: execSyncStub
      }
    });
    installTermuxDeps = module.installTermuxDeps;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should install dependencies successfully', () => {
    execSyncStub.returns(undefined);

    const result = installTermuxDeps();

    expect(execSyncStub.calledTwice).to.be.true;
    expect(execSyncStub.firstCall.args[0]).to.equal('pkg update -y');
    expect(execSyncStub.firstCall.args[1]).to.deep.equal({ stdio: 'inherit' });
    expect(execSyncStub.secondCall.args[0]).to.equal('pkg install -y nodejs-lts git openssh');
    expect(execSyncStub.secondCall.args[1]).to.deep.equal({ stdio: 'inherit' });
    expect(result).to.be.true;
    expect(consoleLogStub.calledWith('Installing Termux dependencies...')).to.be.true;
  });

  it('should return false if pkg update fails', () => {
    execSyncStub.onFirstCall().throws(new Error('Update failed'));

    const result = installTermuxDeps();

    expect(execSyncStub.calledOnce).to.be.true;
    expect(result).to.be.false;
    expect(consoleErrorStub.calledWith('Failed to install Termux packages:', 'Update failed')).to.be.true;
  });

  it('should return false if pkg install fails', () => {
    execSyncStub.onFirstCall().returns(undefined);
    execSyncStub.onSecondCall().throws(new Error('Install failed'));

    const result = installTermuxDeps();

    expect(execSyncStub.calledTwice).to.be.true;
    expect(result).to.be.false;
    expect(consoleErrorStub.calledWith('Failed to install Termux packages:', 'Install failed')).to.be.true;
  });
});

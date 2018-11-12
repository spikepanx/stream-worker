const { AssertionError } = require('assert');
// @ts-ignore
const should = require('chai').should(); // eslint-disable-line
const { expect } = require('chai');

const Source = require('../../src/lib/source');

describe('class Source unit tests', () => {
  it('should decompose params and set instance parameter', () => {
    const jobStream = new Source();

    jobStream.should.haveOwnProperty('jobQueue');
    jobStream.should.haveOwnProperty('monitorDelay');
    jobStream.should.haveOwnProperty('count');
    jobStream.should.haveOwnProperty('stop');
    expect(jobStream.read()).to.be.equal(null);
    jobStream.jobQueue.push(null);
  });

  it('should stream new job added to jobList', () => {
    const job = {
      foo: 'bar',
      task: function myTask() { return this.foo; },
    };

    const jobStream = new Source({ jobList: [job] });

    expect(jobStream.read()).to.be.equal(job);
    expect(jobStream.jobQueue).lengthOf(0);
    jobStream.jobQueue.push(null);
  });

  it('should throw AssertionError if joblist is no array', () => {
    const fn = () => new Source({ jobList: 'foobar' });
    return expect(fn).to.throw(AssertionError);
  });
});

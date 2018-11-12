const { Readable } = require('stream');
const assert = require('assert');

const { floor } = Math;

/**
 * @description
 * @class Source
 * @extends {Readable}
 * @instance {NodeJS.ReadableStream}
 */
class Source extends Readable {
  /**
   *Creates an instance of Source.
   * @param {object} [params={}] Source parameters
   * @param {object} [options={}] NodeJS readable stream options
   * @memberof Source
   */
  constructor(params = {}, options = {}) {
    const { jobList = [], monitorFrequency = 10 } = params;
    assert(Array.isArray(jobList), 'jobList MUST be an instance of Array');

    super({ ...options, objectMode: true }); // enforce objectmode

    this.monitorDelay = floor(1000 / monitorFrequency);
    this.count = 0;
    this.stop = false;
    this.jobQueue = [...jobList];
  }

  /**
   * @description
   * @returns
   * @memberof Source
   */
  _read() {
    const pusher = () => {
      let job = this.jobQueue.shift();

      // if no more waiting jobs, monitor jobList
      if (job === undefined) return setTimeout(pusher, this.monitorDelay);
      // on tombstone stop reading
      if (job === null) return this.push(null);

      assert(job.task instanceof Function, 'Attribute task of job MUST be a function');

      // fill the buffer
      while (job !== undefined && this.push(job)) {
        job = this.jobQueue.shift();
      }

      return undefined;
    };

    return pusher();
  }
}

module.exports = Source;

/**
 * @typedef {object} JobType
 * @property {string} char someting useful
 * @property {Function} task a task function

 * @typedef {object} ReadableOptions
 * @property {boolean=} objectMode
 * @property {number=} highWaterMark
 * @property {string=} encoding
 * @property {boolean=} objectMode
 */

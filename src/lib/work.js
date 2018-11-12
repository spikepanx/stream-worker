const { Transform } = require('stream');

const { floor } = Math;

class Work extends Transform {
  constructor(params, options) {
    const {
      checkQueueFullFreq = 10,
      checkQueueFlushFreq = 10,
      emitErr = false,
      parallelism = 4,
    } = params;

    super({
      ...options,
      readableObjectMode: true,
      writableObjectMode: true,
    });

    this.running = 0;
    this.parallelism = parallelism;
    this.emitErr = emitErr;
    this.checkQueueFullInterval = floor(1e3 / checkQueueFullFreq);
    this.checkQueueFlushInterval = floor(1e3 / checkQueueFlushFreq);
  }

  _flush(cb) {
    if (!this.running) return cb();

    const i = setInterval(() => {
      if (!this.running) {
        clearInterval(i);
        return setImmediate(cb);
      }

      return undefined;
    }, this.checkQueueFlushInterval);

    return undefined;
  }

  _transform(job, enc, cb) {
    const startTask = () => { // task starter
      const { task } = job;

      this.running += 1;
      cb();

      return Promise
        .resolve(task())
        .then(result => this.push(result))
        .then(() => {
          this.running -= 1;
        })
        .catch((err) => {
          this.running -= 1;
          if (this.emitErr) return this.emit('job-err', { job, err });
          return cb(err, null);
        })
      ;
    };

    const runqueueNotFull = this.running < this.parallelism;
    if (runqueueNotFull) return startTask();

    // runqueue is full ...
    const i = setInterval(() => {
      if (this.running < this.parallelism) {
        clearInterval(i);
        return startTask();
      }

      return undefined;
    }, this.checkQueueFullInterval);

    return undefined;
  }
}

module.exports = Work;

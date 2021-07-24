const Timing = {
  easeIn: function easeIn(pos) {
    return Math.pow(pos, 3);
  },

  easeOut: function easeOut(pos) {
    return Math.pow(pos - 1, 3) + 1;
  },

  easeInOut: function easeInOut(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 3);
    } else {
      return 0.5 * (Math.pow(pos - 2, 3) + 2);
    }
  },

  linear: function linear(pos) {
    return pos;
  }
};

/**
 *
 *  opts = {
 *     duration: 1000, 动画结束时间
 *     timing: 'easeIn',  Timing
 *     onProcess: function, 动画回调
 *     onAnimationFinish: function, 结束回调
 *  }
 *
 * @param opts
 * @constructor
 */

class AnimationTool {

  constructor(opts) {
    this.delay = opts.delay || 17
    this.isStop = false
    this.opts = Object.assign({}, opts)
    this.opts.duration = typeof opts.duration === 'undefined' ? 1000 : opts.duration
    this.opts.timing = opts.timing || 'linear'
    this.startTimeStamp = null
    this.animationFrame = null
    this._step = null
  }
  createAnimationFrame() {
    if (typeof requestAnimationFrame !== 'undefined') {
      return requestAnimationFrame;
    } else if (typeof setTimeout !== 'undefined') {
      return function (step, delay) {
        setTimeout(function () {
          let timeStamp = +new Date();
          step(timeStamp);
        }, delay);
      };
    } else {
      return function (step) {
        step(null);
      };
    }
  }
  step(timestamp) {
    if (timestamp === null || this.isStop === true) {
      this.opts.onProcess && this.opts.onProcess(1);
      this.opts.onAnimationFinish && this.opts.onAnimationFinish();
      return;
    }
    if (this.startTimeStamp === null) {
      this.startTimeStamp = timestamp;
    }
    if (timestamp - this.startTimeStamp < this.opts.duration) {
      // console.log('onProcess　111', timestamp)
      let process = (timestamp - this.startTimeStamp) / this.opts.duration;
      let timingFunction = Timing[this.opts.timing];
      process = timingFunction(process);
      this.opts.onProcess && this.opts.onProcess(process);
      this.animationFrame(this._step, this.delay);
    } else {
      this.opts.onProcess && this.opts.onProcess(1);
      this.opts.onAnimationFinish && this.opts.onAnimationFinish();
    }
  };
  start() {
    this.animationFrame = this.createAnimationFrame()
    this._step = this.step.bind(this);
    this.animationFrame(this._step, this.delay);
  }
  stop() {
    // 停止动画
    this.isStop = true;
  }
}
export default AnimationTool;

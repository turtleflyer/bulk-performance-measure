'use strict';

const {
  performance,
  PerformanceObserver
} = require('perf_hooks');

class Measures extends Array {
  constructor() {
    super(...arguments);
  }
}

class BulkPerfMeasurer {
  constructor(numberOfTests) {

    // Init PerformanceObserver to measure duration of a code
    this.obs = new PerformanceObserver((list, observer) => {
      this._duration = list.getEntriesByType('function')[0].duration;
      observer.disconnect();
    });

    this.numberOfTests = numberOfTests; // Number of performing tests
  }

  static measurePerformance(measured, input, obs) {

    if (!obs) {

      // Init PerformanceObserver to measure duration of a code
      obs = new PerformanceObserver(
        function (list, observer) {
          this.duration = list.getEntriesByType('function')[0].duration;
          observer.disconnect();
        });
    }

    // Function wrapping a measured code
    obs.observe({
      entryTypes: ['function']
    });

    (performance.timerify(measured.bind(null, input)))();
    return obs.duration;
  }

  // Performing tests
  static bulkMeasure(codebase, input, numberOfTests) {

    // Init PerformanceObserver to measure duration of a code
    const obs = new PerformanceObserver(
      function (list, observer) {
        this.duration = list.getEntriesByType('function')[0].duration;
        observer.disconnect();
      });

    // Init an empty array to store measured durations
    const measures = new Measures(...[...Array(codebase.length)].map(e => []));

    for (let index = 0; index < codebase.length * numberOfTests; index++) {
      let current = index % codebase.length;
      measures[current].push(BulkPerfMeasurer.measurePerformance(codebase[current], input, obs));
    }

    measures.numberOfTests = numberOfTests;

    return measures;
  }

}

// firstTestsSkipped - Number of the first skipped tests to calculate the stat

class Stat {
  constructor(measures, firstTestsSkipped) {

    if (!(measures instanceof Measures)) throw new Error('Wrong measures input');

    // Calculating the average duration for each code
    if (!firstTestsSkipped) {
      firstTestsSkipped = 0;
    }

    this.average = measures.map(
      arr => arr.reduce(
        (sum, dur, index) => sum + (index < firstTestsSkipped ? 0 : dur), 0) / (measures.numberOfTests - firstTestsSkipped));

    // Building the resulting chart
    this.sorted = this.average.map(
      (e, index) => ({
        codeN: index,
        duration: e
      })).sort(
      (a, b) => (a.duration < b.duration ? -1 : 1));
  }

  output(round, sorted) {

    const amount = this.average.length;
    if (amount == 0) throw new Error('No measurements have been performed');
    const padIndex = getIntPartSize(amount - 1) + 1;
    const padDuration = getIntPartSize(this.sorted[amount - 1].duration) + 1;
    let toPrint;

    if (sorted) {

      toPrint = '\r\nSorted result (best performance first):\r\n' + ''.padStart(17 + padIndex * 2 + padDuration + round, '=') + '\r\n';

      this.sorted.forEach(
        (e, index) => {
          toPrint += function (string, index, codeN, duration) {
            return string[0] + padNumber(index + 1, padIndex, 0) + string[1] + padNumber(codeN, padIndex, 0) + string[2] + formatNumber(duration, padDuration, round) + string[3] + '\r\n';
          }
          `Rank${index}. Code #${e.codeN}: ${e.duration}ms`;
        });

    } else {

      toPrint = '\r\nResult of measurements:\r\n' + ''.padStart(37 + padIndex + padDuration + round, '=') + '\r\n';

      this.average.forEach(
        (e, index) => {
          toPrint += function (string, index, duration) {
            return string[0] + padNumber(index, padIndex, 0) + string[1] + formatNumber(duration, padDuration, round) + string[2] + '\r\n';
          }
          `Average performance for Code #${index} is ${e}ms`;
        });

    }

    return toPrint;
  }
}

function getIntPartSize(x) {
  let l = Math.floor(Math.log(x) / Math.log(10));
  return l < 0 ? 0 : l;
}

function precisionRound(number, precision) {
  var factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

function formatNumber(number, padInteger, precision) {
  const int = Math.floor(number);
  const frac = Math.round((number - int) * (10 ** precision));
  return `${padNumber(int, padInteger, ' ')}.${frac.toString().padStart(precision, 0)}`;
}

function padNumber(number, pad, fill) {
  return number.toString().padStart(pad, fill);
}

module.exports.BulkPerfMeasurer = BulkPerfMeasurer;
module.exports.Stat = Stat;

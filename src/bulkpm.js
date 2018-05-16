const {
  performance,
  PerformanceObserver
} = require('perf_hooks');


module.exports.BulkPerfMeasurer = class BulkPerfMeasurer {
  constructor(numberOfTests, firstTestsSkipped = 0) {

    // Init PerformanceObserver to measure duration of a code
    this.obs = new PerformanceObserver(function (list, observer) {
      this.duration = list.getEntriesByType('function')[0].duration;
      observer.disconnect();
    });

    this.numberOfTests = numberOfTests; // Number of performing tests
    this.firstTestsSkipped = firstTestsSkipped; // Number of the first skipped tests to calculate the stat
  }

  static measurePerformance(measured, input, measurer) {

    // Function wrapping a measured code
    measurer.obs.observe({
      entryTypes: ['function']
    });

    (performance.timerify(measured.bind(null, input)))();
    return measurer.obs.duration;
  }

  // Performing tests
  static bulkMeasure(codebase, input, measurer) {

    // Init an empty array to store measured durations
    measurer.measuresStat = [...Array(codebase.length)].map(e => []);

    for (let index = 0; index < codebase.length * measurer.numberOfTests; index++) {
      let current = index % codebase.length;
      measurer.measuresStat[current].push(BulkPerfMeasurer.measurePerformance(codebase[current], input, measurer));
    }

    // Calculating the average duration for each code
    const average = measurer.measuresStat.map(arr => arr.reduce((sum, dur, index) => sum + (index < measurer.firstTestsSkipped ? 0 : dur), 0) / (measurer.numberOfTests - measurer.firstTestsSkipped));

    // Building the resulting chart
    const sorted = average.map((e, index) => ({
      codeN: index,
      duration: e
    })).sort((a, b) => (a.duration < b.duration ? -1 : 1));

    return {
      average: new AverageStat(average),
      sorted: new SortedStat(sorted)
    };
  }

};

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

class AverageStat extends Array {
  constructor(arr) {
    super(...arr);
  }

  print(round) {
    if (this.length == 0) throw new Error('No measurements have yet been performed')
    console.log('\r\nResult of measurements:\r\n=======================\r\n');
    this.forEach((e, index) => {
      console.log(`Average performance for code #${index} is ${precisionRound(e, round)}ms`);
    });
  }
}

class SortedStat extends Array {
  constructor(arr) {
    super(...arr);
  }

  print(round) {
    if (this.length == 0) throw new Error('No measurements have yet been performed')
    console.log('\r\nSorted result (best performance first):\r\n=======================================\r\n');
    this.forEach((e, index) => {
      console.log(`Place ${(index + 1)}. Code # ${e.codeN}: ${precisionRound(e.duration, round)}ms`);
    });
  }
}

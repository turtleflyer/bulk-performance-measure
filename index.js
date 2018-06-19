const { performance, PerformanceObserver } = require('perf_hooks');

function getIntPartSize(x) {
  let l = Math.floor(Math.log(x) / Math.log(10));
  return l < 0 ? 0 : l;
}

function formatNumber(number, padInteger, precision) {
  const int = Math.floor(number);
  const frac = Math.round((number - int) * 10 ** precision);
  return `${padNumber(int, padInteger, ' ')}.${frac
    .toString()
    .padStart(precision, 0)}`;
}

function padNumber(number, pad, fill) {
  return number.toString().padStart(pad, fill);
}

class Measurement extends Array {}

class BulkPerfMeasurer {
  static measurePerformance(measured, input, passedObserver) {
    let observer;
    if (!passedObserver) {
      // Init PerformanceObserver to measure duration of a code if it has not been passed
      observer = new PerformanceObserver(function(list, observer) {
        this.duration = list.getEntriesByType('function')[0].duration;
        observer.disconnect();
      });
    } else {
      observer = passedObserver;
    }

    // Init observer
    observer.observe({
      entryTypes: ['function'],
    });

    // Function wrapping a measured code
    performance.timerify(measured.bind(null, ...input))();
    return observer.duration;
  }

  // Performing bulk measures
  static bulkMeasure(codebase, input, numberOfTests) {
    // Init PerformanceObserver to measure duration of a code
    const observer = new PerformanceObserver(function(list, observer) {
      this.duration = list.getEntriesByType('function')[0].duration;
      observer.disconnect();
    });

    // Init an empty array to store measured durations
    const measurement = new Measurement(
      ...[...Array(codebase.length)].map(e => []),
    );

    // Performing tests
    for (let i = 0; i < numberOfTests; i++) {
      for (let index = 0; index < codebase.length; index++) {
        measurement[index].push(
          BulkPerfMeasurer.measurePerformance(codebase[index], input, observer),
        );
      }
    }

    // Hold the number of performed tests to calculate average performance
    measurement.numberOfTests = numberOfTests;

    return measurement;
  }
}

// firstTestsSkipped - Number of the first tests to skip when the stat is calculating

class Stat {
  constructor(measurement, firstTestsSkipped) {
    if (!(measurement instanceof Measurement)) {
      throw new Error('Wrong measurement input');
    }

    let toSkip;
    if (!firstTestsSkipped) {
      toSkip = 0;
    } else {
      toSkip = firstTestsSkipped;
    }

    // Calculating the average duration for each code
    this.average = measurement.map(
      arr =>
        arr.reduce((sum, dur, index) => sum + (index < toSkip ? 0 : dur), 0) /
        (measurement.numberOfTests - toSkip),
    );

    // Creating sorted chart
    this.sorted = this.average
      .map((e, index) => ({
        codeN: index,
        duration: e,
      }))
      .sort((a, b) => (a.duration < b.duration ? -1 : 1));
  }

  // Building a string exposing the result.
  // SortedFlag determines whatever sorted result is to be outputted.
  output(round, sortedFlag) {
    const amount = this.average.length;
    if (amount === 0) throw new Error('No measurements have been performed');
    const padIndex = getIntPartSize(amount - 1) + 1;
    const padDuration = getIntPartSize(this.sorted[amount - 1].duration) + 1;
    let toPrint;

    if (sortedFlag) {
      toPrint = `\r\nSorted result (best performance first):\r\n${''.padStart(
        18 + padIndex * 2 + padDuration + round,
        '=',
      )}\r\n`;

      this.sorted.forEach((e, index) => {
        toPrint += `Rank ${padNumber(index + 1, padIndex, 0)}. Code #${padNumber(
          e.codeN,
          padIndex,
          0,
        )}: ${formatNumber(e.duration, padDuration, round)}ms\r\n`;
      });
    } else {
      toPrint = `\r\nResult of measurements:\r\n${''.padStart(
        37 + padIndex + padDuration + round,
        '=',
      )}\r\n`;

      this.average.forEach((e, index) => {
        toPrint += `Average performance for Code #${padNumber(
          index,
          padIndex,
          0,
        )} is ${formatNumber(e, padDuration, round)}ms\r\n`;
      });
    }

    return toPrint;
  }
}

module.exports.BulkPerfMeasurer = BulkPerfMeasurer;
module.exports.Stat = Stat;

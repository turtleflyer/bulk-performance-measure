const { performance, PerformanceObserver } = require('perf_hooks');

class MeasureError extends Error {
  constructor(message) {
    super(`MEASUREMENT ERROR: ${message}`);
  }
}

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
  static measurePerformance(
    measured,
    input,
    // Init PerformanceObserver to measure duration of a code if it has not been passed
    observer = new PerformanceObserver(function(list, obs) {
      this.duration = list.getEntries()[0].duration;
      obs.disconnect();
    }),
  ) {
    // Init observer
    observer.observe({
      entryTypes: ['function'],
    });

    // Function wrapping a measured code
    performance.timerify(measured.bind(null, ...input))();
    return observer.duration;
  }

  // Performing bulk measures
  static bulkMeasure(codebase, input, numberOfTests = 1) {
    if (!Array.isArray(codebase)) {
      throw new MeasureError('Measured code has to be wrapped into array');
    }
    if (!Array.isArray(input)) {
      throw new MeasureError(
        'Arguments passed to measured code have to be wrapped into array',
      );
    }
    if (typeof numberOfTests !== 'number' || numberOfTests <= 0) {
      throw new MeasureError('Number of performed tests has to be greater than 0');
    }
    // Init PerformanceObserver to measure duration of a code
    const observer = new PerformanceObserver(function(list, obs) {
      this.duration = list.getEntries()[0].duration;
      obs.disconnect();
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
  constructor(measurement, firstTestsSkipped = 0) {
    if (!(measurement instanceof Measurement)) {
      throw new MeasureError('Wrong measurement input');
    }

    // Calculating the average duration for each code
    this.average = measurement.map(
      arr =>
        arr.reduce(
          (sum, dur, index) => sum + (index < firstTestsSkipped ? 0 : dur),
          0,
        ) /
        (measurement.numberOfTests - firstTestsSkipped),
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
  output(round = 3, sortedFlag = false) {
    const amount = this.average.length;
    const padIndex = getIntPartSize(amount - 1) + 1;
    const padDuration = getIntPartSize(this.sorted[amount - 1].duration) + 1;
    let toPrint;

    if (sortedFlag) {
      toPrint = `\r\nSorted result (best performance first):\r\n${''.padStart(
        18 + padIndex * 2 + padDuration + round,
        '=',
      )}\r\n`;

      this.sorted.forEach((e, index) => {
        toPrint += `Rank ${padNumber(
          index + 1,
          padIndex,
          0,
        )}. Code #${padNumber(e.codeN, padIndex, 0)}: ${formatNumber(
          e.duration,
          padDuration,
          round,
        )}ms\r\n`;
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

  static createStat(measurement, firstTestsSkipped = 0) {
    return new Stat(measurement, firstTestsSkipped);
  }

  static getRawOutput(stat, round = 3) {
    if (!(stat instanceof Stat)) {
      throw new MeasureError('Wrong argument for stat output');
    }
    return stat.output(round, false);
  }

  static getSortedOutput(stat, round = 3) {
    if (!(stat instanceof Stat)) {
      throw new MeasureError('Wrong argument for stat output');
    }
    return stat.output(round, true);
  }
}

module.exports.BulkPerfMeasurer = BulkPerfMeasurer;
module.exports.Stat = Stat;

const fs = require('fs');
const {BulkPerfMeasurer, Stat} = require('../src/bulkpm');

// The array of measured codes is storing in the file
const codebase = require('./codebase');
console.log(process.cwd());

const data = fs.readFileSync('./test/input.txt');

const measurer = new BulkPerfMeasurer();

let measures = BulkPerfMeasurer.bulkMeasure(codebase, data, measurer, 10);

let stat = new Stat(measures, 0);

console.log(stat.print(3));
console.log(stat.print(3, true));

const fs = require('fs');
const {BulkPerfMeasurer, Stat} = require('../src/bulkpm');

// The array of measured codes is storing in the file
const codebase = require('./codebase');
console.log(process.cwd());

const data = fs.readFileSync('./example/input.txt');

let measures = BulkPerfMeasurer.bulkMeasure(codebase, data, 100);

let stat = new Stat(measures, 0);
let statSkip = new Stat(measures, 1);

console.log(stat.output(3));
console.log(stat.output(3, true));
console.log(statSkip.output(3, true));

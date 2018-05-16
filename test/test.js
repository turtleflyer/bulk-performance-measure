const fs = require('fs');
const {BulkPerfMeasurer} = require('../src/bulkpm');

// The array of measured codes is storing in the file
const codebase = require('./codebase');
console.log(process.cwd());

const data = fs.readFileSync('./test/input.txt');

const measurer = new BulkPerfMeasurer(200, 5);

let {average, sorted} = BulkPerfMeasurer.bulkMeasure(codebase, data, measurer);

average.print(3);
sorted.print(4);

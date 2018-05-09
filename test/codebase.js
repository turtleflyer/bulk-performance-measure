module.exports = [

  // 0
  function (data) {
    let dataToString = data.toString('utf8');
    console.log(Array.from(dataToString).reduce(
      (currentLevel, nextParenthesis) =>
      nextParenthesis == '(' ? ++currentLevel : --currentLevel, 0));
  },

  // 1
  function (data) {
    console.log(Array.from(data.toString('utf8')).reduce(
      (currentLevel, nextParenthesis) =>
      nextParenthesis == '(' ? ++currentLevel : --currentLevel, 0));
  },

  // 2
  function (data) {
    console.log(data.toString('utf8').split('').reduce(
      (currentLevel, nextParenthesis) =>
      nextParenthesis == '(' ? ++currentLevel : --currentLevel, 0));
  },

  // 3
  function (data) {
    console.log(data.reduce((currentLevel, nextParenthesis) =>
      nextParenthesis == 40 ? ++currentLevel : --currentLevel, 0));
  },

  // 4
  function (data) {
    let dataToString = data.toString('utf8');
    console.log(2 * Array.from(dataToString).reduce(
      (currentLevel, nextParenthesis) => {
        if (nextParenthesis == '(') return ++currentLevel;
        return currentLevel;
      }, 0) - dataToString.length);
  },

  // 5
  function (data) {
    let dataToString = data.toString('utf8');
    console.log(2 * dataToString.split('').filter(
      (parenthesis) => parenthesis == '(').length - dataToString.length);
  },

  // 6
  function (data) {
    dataToString = data.toString('utf8');
    console.log(2 * Array.from(dataToString).filter(
      (parenthesis) => parenthesis == '(').length - dataToString.length);
  },

  // 7
  function (data) {
    console.log(2 * data.filter(
      (parenthesis) => parenthesis == 40).length - data.length);
  },

  // 8
  function (data) {
    console.log(Array.prototype.reduce.call(data.toString('utf8'),
      (currentLevel, nextParenthesis) =>
      nextParenthesis == '(' ? ++currentLevel : --currentLevel,
      0
    ));
  },

  // 9
  function (data) {
    let dataToString = data.toString('utf8').split('');
    let length = dataToString.length;
    let openParCounter = 0;
    for (const parenthesis of dataToString) {
      if (parenthesis == '(') openParCounter++;
    }
    console.log(openParCounter * 2 - length);
  },

  // 10
  function (data) {
    let dataToString = data.toString('utf8').split('');
    let length = dataToString.length;
    let openParCounter = 0;
    for (const parenthesis of dataToString) {
      if (parenthesis == '(') openParCounter += 2;
    }
    console.log(openParCounter - length);
  },

  // 11
  function (data) {
    let length = data.length;
    let openParCounter = 0;
    for (const parenthesis of data) {
      if (parenthesis == 40) openParCounter++;
    }
    console.log(openParCounter * 2 - length);
  },

  // 12
  function (data) {
    let length = data.length;
    let openParCounter = 0;
    for (const parenthesis of data) {
      if (parenthesis == 40) openParCounter += 2;
    }
    console.log(openParCounter - length);
  },

  // 13
  function (data) {
    let dataToString = data.toString('utf8');
    let length = dataToString.length;
    let openParCounter = 0;
    for (let index = 0; index < length; index++) {
      if (dataToString[index] == '(') openParCounter++;
    }
    console.log(openParCounter * 2 - length);
  },

  // 14
  function (data) {
    let length = data.length;
    let openParCounter = 0;
    for (let index = 0; index < length; index++) {
      if (data[index] == 40) openParCounter++;
    }
    console.log(openParCounter * 2 - length);
  },

  // 15
  function (data) {
    let dataToString = data.toString('utf8');
    console.log(dataToString.match(/\(/g).length * 2 - dataToString.length);
  },

  // 16
  function (data) {
    console.log(data.toString('utf8').match(/\(/g).length * 2 - data.length);
  },

  // 17
  function (data) {
    let dataToString = data.toString('utf8');
    let lastLength;
    do {
      lastLength = dataToString.length;
      dataToString = dataToString.replace(/(\(\))|(\)\()/g, '');
    } while (lastLength != dataToString.length);
    console.log(dataToString[0] == '(' ? lastLength : -lastLength);
  },

  // 18
  function (data) {
    let length = data.length;
    let openParCounter = 0;
    const iterator = data[Symbol.iterator](data);
    let resOfIteration;
    do {
      resOfIteration = iterator.next(data);
      if (resOfIteration.value == 40) openParCounter++;
    } while (!resOfIteration.done);
    console.log(openParCounter * 2 - length);
  },

  // 19
  function (data) {
    let dataToString = data.toString('utf8');
    let length = dataToString.length;
    let openParCounter = 0;
    const iterator = dataToString[Symbol.iterator](data);
    let resOfIteration;
    do {
      resOfIteration = iterator.next(data);
      if (resOfIteration.value == '(') openParCounter++;
    } while (!resOfIteration.done);
    console.log(openParCounter * 2 - length);
  }
];

const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const Cases = require('../../../tools/cases');
const writeSelectors = require('./writeSelectors');
const writeReducer = require('./writeReducer');

const addDomain = (identifier, folderName) => {
  const cases = new Cases(identifier);
  const allCases = cases.all();

  /** Selectors File */
  fs.readFile(`${folderName}/selectors.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/selectors.js`,
      writeSelectors(buf, allCases),
      () => {
        console.log('Selectors written!');
      },
    );
  });

  /** Reducers File */
  fs.readFile(`${folderName}/reducer.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/reducer.js`,
      writeReducer(buf, allCases),
      () => {
        console.log('Reducer written!');
      },
    );
  });
};

module.exports = addDomain;

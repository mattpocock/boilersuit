const colors = require('colors');
const fs = require('fs');
const Cases = require('../tools/cases');
const writeIndex = require('./writeIndex');
const writeSelectors = require('./writeSelectors');
const writeActions = require('./writeActions');
const writeConstants = require('./writeConstants');
const writeReducer = require('./writeReducer');

const single = (identifier, folderName) => {
  const cases = new Cases(identifier);
  const allCases = cases.all();

  /** Index file */
  fs.readFile(`${folderName}/index.js`, (err, buf) => {
    fs.writeFile(
      `${folderName}/index.js`,
      writeIndex(buf, allCases),
      err => {
        console.log('Index written!'.white);
      },
    );
  });

  /** Selectors File */
  fs.readFile(`${folderName}/selectors.js`, (err, buf) => {
    fs.writeFile(
      `${folderName}/selectors.js`,
      writeSelectors(buf, allCases),
      () => {
        console.log('Selectors written!'.white);
      },
    );
  });

  /** Actions File */
  fs.readFile(`${folderName}/actions.js`, (err, buf) => {
    fs.writeFile(
      `${folderName}/actions.js`,
      writeActions(buf, allCases),
      err => {
        console.log('Actions written!'.white);
      },
    );
  });

  /** Constants File */
  fs.readFile(`${folderName}/constants.js`, (err, buf) => {
    fs.writeFile(
      `${folderName}/constants.js`,
      writeConstants(buf, allCases, folderName),
      () => {
        console.log('Constants Written!'.white);
      },
    );
  });

  /** Reducers File */
  fs.readFile(`${folderName}/reducer.js`, (err, buf) => {
    fs.writeFile(
      `${folderName}/reducer.js`,
      writeReducer(buf, allCases),
      err => {
        console.log('Reducer written!'.white);
      },
    );
  });
};

module.exports = single;

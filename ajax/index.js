const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const Cases = require('../tools/cases');
const writeIndex = require('./writeIndex');
const writeSelectors = require('./writeSelectors');
const writeActions = require('./writeActions');
const writeConstants = require('./writeConstants');
const writeReducer = require('./writeReducer');
const writeSaga = require('./writeSaga');

const ajax = (identifier, folderName) => {
  const cases = new Cases(identifier);
  const allCases = cases.all();

  /** Index file */
  fs.readFile(`${folderName}/index.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/index.js`,
      writeIndex(buf, allCases),
      () => {
        console.log('Index written!'.white);
      },
    );
  });

  /** Selectors File */
  fs.readFile(`${folderName}/selectors.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/selectors.js`,
      writeSelectors(buf, allCases),
      () => {
        console.log('Selectors written!'.white);
      },
    );
  });

  /** Actions File */
  fs.readFile(`${folderName}/actions.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/actions.js`,
      writeActions(buf, allCases),
      () => {
        console.log('Actions written!'.white);
      },
    );
  });

  /** Constants File */
  fs.readFile(`${folderName}/constants.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/constants.js`,
      writeConstants(buf, allCases, folderName),
      () => {
        console.log('Constants Written!'.white);
      },
    );
  });

  /** Reducers File */
  fs.readFile(`${folderName}/reducer.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/reducer.js`,
      writeReducer(buf, allCases),
      () => {
        console.log('Reducer written!'.white);
      },
    );
  });

  /** Saga File */
  fs.readFile(`${folderName}/saga.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/saga.js`,
      writeSaga(buf, allCases),
      () => {
        console.log('Saga written!'.white);
      },
    );
  });
};

module.exports = ajax;

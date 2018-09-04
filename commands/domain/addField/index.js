const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const Cases = require('../../../tools/cases');
const writeIndex = require('./writeIndex');
const writeSelectors = require('./writeSelectors');
const writeReducer = require('./writeReducer');
const { checkSelectors, checkReducer } = require('./checkForDomain');

const addField = (identifier, folderName, domain) => {
  const cases = new Cases(identifier);
  const allCases = cases.all();
  const domainCases = new Cases(domain);
  const allDomainCases = domainCases.all();

  const foundInSelectors = checkSelectors(
    fs.readFileSync(`${folderName}/selectors.js`),
    allDomainCases,
  );
  const foundInReducer = checkReducer(
    fs.readFileSync(`${folderName}/reducer.js`),
    allDomainCases,
  );
  if (!foundInReducer || !foundInSelectors) {
    console.log(`Domain '${allDomainCases.display}' not found.`.yellow);
    return;
  }

  /** Index file */
  fs.readFile(`${folderName}/index.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/index.js`,
      writeIndex(buf, allCases, allDomainCases),
      () => {
        console.log('Index written!'.white);
      },
    );
  });

  /** Selectors File */
  fs.readFile(`${folderName}/selectors.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/selectors.js`,
      writeSelectors(buf, allCases, allDomainCases),
      () => {
        console.log('Selectors written!'.white);
      },
    );
  });

  /** Reducers File */
  fs.readFile(`${folderName}/reducer.js`, (_, buf) => {
    fs.writeFile(
      `${folderName}/reducer.js`,
      writeReducer(buf, allCases, allDomainCases),
      () => {
        console.log('Reducer written!'.white);
      },
    );
  });
};

module.exports = addField;

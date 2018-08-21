const colors = require('colors');
const fs = require('fs');
const Cases = require('../tools/cases');
const Parser = require('../tools/parser');
const { concat, fixFolderName } = require('../tools/utils');
const writeIndex = require('./writeIndex');
const writeSelectors = require('./writeSelectors');

const ajax = (identifier, folderName) => {
  const cases = new Cases(identifier);
  const allCases = cases.all();
  const { camel, display, pascal, constant } = allCases;

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

  fs.readFile(`${folderName}/actions.js`, (err, buf) => {
    const buffer = buf.toString();
    const parser = new Parser(buffer);

    const stringToInsert = concat([
      ``,
      `/** ${display} */`,
      ``,
      `export const ${camel}Started = () => ({`,
      `  type: ${constant}_STARTED,`,
      `});`,
      ``,
      `export const ${camel}Failed = () => ({`,
      `  type: ${constant}_FAILED,`,
      `});`,
      ``,
      `export const ${camel}Succeeded = () => ({`,
      `  type: ${constant}_SUCCEEDED,`,
      `});`,
      ``,
    ]);

    const { index: importsIndex, prefix, suffix } = parser.getImportIndex(
      './constants',
    );
    const importsToInsert = concat([
      `${prefix || ''}${constant}_STARTED,`,
      `  ${constant}_SUCCEEDED,`,
      `  ${constant}_FAILED${suffix || ''}`,
    ]);

    fs.writeFile(
      `${folderName}/actions.js`,
      buffer.slice(0, importsIndex) +
        importsToInsert +
        buffer.slice(importsIndex) +
        stringToInsert,
      err => {
        console.log('Actions written!'.white);
      },
    );
  });

  fs.readFile(`${folderName}/constants.js`, (err, buf) => {
    const buffer = buf.toString();

    let fixedFolderName = fixFolderName(folderName);

    fs.writeFile(
      `${folderName}/constants.js`,
      concat([
        buffer,
        `/** ${display} */`,
        `export const ${constant}_STARTED =`,
        `  'app/${fixedFolderName}${constant}_STARTED';`,
        `export const ${constant}_SUCCEEDED =`,
        `  'app/${fixedFolderName}${constant}_SUCCEEDED';`,
        `export const ${constant}_FAILED =`,
        `  'app/${fixedFolderName}${constant}_FAILED';`,
        ``,
      ]),
      () => {
        console.log('Constants Written!'.white);
      },
    );
  });

  fs.readFile(`${folderName}/reducer.js`, (err, buf) => {
    const buffer = buf.toString();
    const parser = new Parser(buffer);

    const {
      index: lastExportIndex,
      suffix: lastExportSuffix,
    } = parser.getExportDefaultIndex();

    const stringToInsert = concat([
      `const initial${pascal}State = fromJS({`,
      `  isLoading: false,`,
      `  hasError: false,`,
      `  hasSucceeded: false,`,
      `  ${camel}Data: [],`,
      `  errorMessage: '',`,
      `});`,
      ``,
      `/** ${display} Reducer */`,
      ``,
      `export const ${camel}Reducer = (state = initial${pascal}State, action) => {`,
      `  switch (action.type) {`,
      `    case ${constant}_STARTED:`,
      `      return state.set('isLoading', true);`,
      `    case ${constant}_FAILED:`,
      `      return state`,
      `        .set('isLoading', false)`,
      `        .set('hasError', true)`,
      `        .set('errorMessage', action.payload);`,
      `    case ${constant}_SUCCEEDED:`,
      `      return state`,
      `        .set('isLoading', false)`,
      `        .set('hasSucceeded', true)`,
      `        .set('${camel}Data', action.payload);`,
      `    default:`,
      `      return state;`,
      `  }`,
      `};`,
      `${lastExportSuffix || ''}`,
    ]);

    /** Insert imports */
    const { index: importsIndex, ...imports } = parser.getImportIndex(
      './constants',
    );
    const importsToInsert = concat([
      `${imports.prefix || ''}${constant}_STARTED,`,
      `  ${constant}_SUCCEEDED,`,
      `  ${constant}_FAILED${imports.suffix || ''}`,
    ]);

    let {
      index: reducersIndex,
      wasFound,
      ...reducers
    } = parser.getCombineReducers();

    let reducerToInsert = '';
    if (wasFound) {
      reducerToInsert = `${
        reducers.prefix
      }  ${camel}: ${camel}Reducer, ${reducers.suffix || ''}`;
    } else {
      console.log(`No combineReducers found in './reducer'`.red.bold);
      reducerToInsert = concat([
        `${reducers.prefix ||
          ''}  ${camel}: ${camel}Reducer,${reducers.suffix || ''}`,
        '',
      ]);
    }

    fs.writeFile(
      `${folderName}/reducer.js`,
      buffer.slice(0, importsIndex) +
        importsToInsert +
        buffer.slice(importsIndex, lastExportIndex) +
        stringToInsert +
        buffer.slice(lastExportIndex, reducersIndex) +
        reducerToInsert +
        buffer.slice(reducersIndex),
      err => {
        console.log('Reducer written!'.white);
      },
    );
  });
};

module.exports = ajax;

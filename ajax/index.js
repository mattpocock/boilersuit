const colors = require('colors');
const fs = require('fs');
const Cases = require('../tools/cases');
const Parser = require('../tools/parser');
const { concat, fixFolderName } = require('../tools/utils');

const ajax = (identifier, folderName) => {
  const cases = new Cases(identifier);
  const { camel, display, pascal, constant } = cases.all();

  /** Index file */
  fs.readFile(`${folderName}/index.js`, (err, buf) => {
    const buffer = buf.toString();
    const parser = new Parser(buffer);

    const mapStateToPropsBeginning = buffer.indexOf('mapStateToProps');
    const mapStateToPropsEnd = buffer.indexOf('});', mapStateToPropsBeginning);

    const stringToInsert = concat([
      `  /** ${display} */`,
      `  is${pascal}Loading: makeSelectIs${pascal}Loading(),`,
      `  has${pascal}Failed: makeSelect${pascal}HasFailed(),`,
      `  has${pascal}Succeeded: makeSelect${pascal}HasSucceeded(),`,
      `  ${camel}Data: makeSelect${pascal}Data(),`,
      `  ${camel}ErrorMessage: makeSelect${pascal}ErrorMessage(),`,
      ``,
    ]);

    /** Selectors */
    const { index: selectorsIndex, ...selectors } = parser.getImportIndex(
      './selectors',
    );
    const selectorsToInsert = concat([
      `${selectors.prefix || ''}makeSelectIs${pascal}Loading,`,
      `  makeSelect${pascal}HasFailed,`,
      `  makeSelect${pascal}HasSucceeded,`,
      `  makeSelect${pascal}Data,`,
      `  makeSelect${pascal}ErrorMessage${selectors.suffix || ''}`,
    ]);

    /** Dispatch to props */
    const mapDispatchToPropsBeginning = buffer.indexOf('mapDispatchToProps');
    const mapDispatchToPropsEnd =
      buffer.indexOf('return {', mapDispatchToPropsBeginning) + 8;

    const dispatchToInsert = `
    submit${pascal}: () => dispatch(${camel}Started()),`;

    /** Actions */
    const { index: actionIndex, ...actions } = parser.getImportIndex(
      './actions',
    );
    const actionToInsert = `${actions.prefix ||
      ''}${camel}Started${actions.suffix || ''}`;

    fs.writeFile(
      `${folderName}/index.js`,
      buffer.slice(0, selectorsIndex) +
        selectorsToInsert +
        buffer.slice(selectorsIndex, actionIndex) +
        actionToInsert +
        buffer.slice(actionIndex, mapStateToPropsEnd) +
        stringToInsert +
        buffer.slice(mapStateToPropsEnd, mapDispatchToPropsEnd) +
        dispatchToInsert +
        buffer.slice(mapDispatchToPropsEnd),
      err => {
        console.log('Index written!'.white);
      },
    );
  });

  /** Selectors File */
  fs.readFile(`${folderName}/selectors.js`, (err, buf) => {
    const buffer = buf.toString();

    fs.writeFile(
      `${folderName}/selectors.js`,
      concat([
        buffer,
        '',
        `/**`,
        ` * ${display}`,
        ` */`,
        ``,
        `export const makeSelect${pascal} = () =>`,
        `  createSelector(selectDomain, (substate) => fromJS(substate.${camel}));`,
        `export const makeSelectIs${pascal}Loading = () =>`,
        `  createSelector(makeSelect${pascal}(), (substate) => substate.get('isLoading'));`,
        `export const makeSelect${pascal}HasFailed = () =>`,
        `  createSelector(makeSelect${pascal}(), (substate) => substate.get('hasError'));`,
        `export const makeSelect${pascal}HasSucceeded = () =>`,
        `  createSelector(makeSelect${pascal}(), (substate) => substate.get('hasSucceeded'));`,
        `export const makeSelect${pascal}Data = () =>`,
        `  createSelector(makeSelect${pascal}(), (substate) => substate.get('${camel}Data'));`,
        `export const makeSelect${pascal}ErrorMessage = () =>`,
        `  createSelector(makeSelect${pascal}(), (substate) => substate.get('${camel}errorMessage'));`,
        ``,
      ]),
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
      reducerToInsert = `${reducers.prefix}  ${camel}: ${camel}Reducer, ${
        reducers.suffix || ''
      }`;
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

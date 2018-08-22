const Parser = require('../tools/parser');
const { concat } = require('../tools/utils');

module.exports = (buf, { pascal, camel, display, constant }) => {
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
      `${reducers.prefix || ''}  ${camel}: ${camel}Reducer,${reducers.suffix ||
        ''}`,
      '',
    ]);
  }

  return (
    buffer.slice(0, importsIndex) +
    importsToInsert +
    buffer.slice(importsIndex, lastExportIndex) +
    stringToInsert +
    buffer.slice(lastExportIndex, reducersIndex) +
    reducerToInsert +
    buffer.slice(reducersIndex)
  );
};

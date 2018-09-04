const Parser = require('../../tools/parser');
const { concat } = require('../../tools/utils');

module.exports = (buf, {
  pascal, camel, display, constant,
}) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  const {
    index: lastExportIndex,
    suffix: lastExportSuffix,
  } = parser.getExportDefaultIndex();

  const stringToInsert = concat([
    `const initial${pascal}State = fromJS({`,
    `  value: null,`,
    `});`,
    ``,
    `/** ${display} Reducer */`,
    ``,
    `export const ${camel}Reducer = (state = initial${pascal}State, action) => {`,
    `  switch (action.type) {`,
    `    case CHANGE_${constant}:`,
    `      return state.set('value', action.payload);`,
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
    `${imports.prefix || ''}CHANGE_${constant}${imports.suffix || ''}`,
  ]);

  const {
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

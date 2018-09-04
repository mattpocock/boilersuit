const Parser = require('../../../tools/parser');
const { concat } = require('../../../tools/utils');

module.exports = (buf, {
  pascal, camel, display,
}) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  if (parser.includes(`export const ${camel}Reducer = `)) {
    console.log(`Domain ${display} already present in './reducers'!`.white);
    return buffer;
  }

  const {
    index: lastExportIndex,
    suffix: lastExportSuffix,
  } = parser.getExportDefaultIndex();

  const stringToInsert = concat([
    `/** ${display} Reducer */`,
    ``,
    `const initial${pascal}State = fromJS({});`,
    ``,
    `export const ${camel}Reducer = (state = initial${pascal}State, { type }) => {`,
    `  switch (type) {`,
    `    default:`,
    `      return state;`,
    `  }`,
    `};`,
    `${lastExportSuffix || ''}`,
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
    buffer.slice(0, lastExportIndex) +
    stringToInsert +
    buffer.slice(lastExportIndex, reducersIndex) +
    reducerToInsert +
    buffer.slice(reducersIndex)
  );
};

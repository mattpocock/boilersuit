const fs = require('fs');
const Parser = require('../../tools/parser');
const { concat, transforms } = require('../../tools/utils');
const ensureFromJSImported = require('../global/ensureFromJsImported');

module.exports = ({
  file,
  cases: { pascal, camel, display },
  initialState,
  // actions,
}) => {
  const buf = fs.readFileSync(file);
  const buffer = buf.toString();
  const parser = new Parser(buffer);
  const domainExists = parser.includes(
    concat([`// @boilersuit`, `const initial${pascal}State = fromJS(`]),
  );

  const newBuffer = transforms(buffer, [
    ensureFromJSImported,
    /** If domain exists, replace initial State */
    b => {
      if (!domainExists) return b;
      const p = new Parser(b);
      const searchTerm = concat([
        `// @boilersuit`,
        `const initial${pascal}State = fromJS(`,
      ]);
      const startIndex = p.toNext(searchTerm).index + searchTerm.length;
      const { index: endIndex } = p.toNext(');');
      console.log(`Updating ${display} Initial State!`.white);
      return concat([
        b.slice(0, startIndex),
        JSON.stringify(initialState),
        b.slice(endIndex),
      ]);
    },
    /** Adds in boilerplate if domain does not exist */
    b => {
      if (domainExists) return b;
      const index = b.lastIndexOf('export default');
      console.log(`Writing ${display} Reducer!`.white);
      return concat([
        b.slice(0, index),
        `/** ${display} Reducer */`,
        ``,
        `// @boilersuit`,
        `const initial${pascal}State = fromJS(`,
        JSON.stringify(initialState),
        `);`,
        ``,
        `export const ${camel}Reducer = (state = initial${pascal}State, { type, payload }) => {`,
        `  switch (type) {`,
        `    default:`,
        `      return state;`,
        `  }`,
        `};`,
        ``,
        b.slice(index),
      ]);
    },
    /** Adds to combineReducers */
    b => {
      if (domainExists) return b;
      const searchTerm = 'combineReducers({';
      const index = b.indexOf(searchTerm) + searchTerm.length;
      return (
        concat([b.slice(0, index), `  ${camel}: ${camel}Reducer,`]) +
        b.slice(index)
      );
    },
  ]);

  fs.writeFileSync(file, newBuffer);

  // const {
  //   index: reducersIndex,
  //   wasFound,
  //   ...reducers
  // } = parser.getCombineReducers();

  // let reducerToInsert = '';
  // if (wasFound) {
  //   reducerToInsert = `${
  //     reducers.prefix
  //   }  ${camel}: ${camel}Reducer, ${reducers.suffix || ''}`;
  // } else {
  //   console.log(`No combineReducers found in './reducer'`.red.bold);
  //   reducerToInsert = concat([
  //     `${reducers.prefix || ''}  ${camel}: ${camel}Reducer,${reducers.suffix ||
  //       ''}`,
  //     '',
  //   ]);
  // }

  // return (
  //   buffer.slice(0, importsIndex) +
  //   importsToInsert +
  //   buffer.slice(importsIndex, lastExportIndex) +
  //   stringToInsert +
  //   buffer.slice(lastExportIndex, reducersIndex) +
  //   reducerToInsert +
  //   buffer.slice(reducersIndex)
  // );
};

const fs = require('fs');
const Parser = require('../../tools/parser');
const Cases = require('../../tools/cases');
const writeActionsInReducer = require('./writeActionsInReducer');
const {
  concat,
  transforms,
  parseCamelCaseToArray,
  printObject,
} = require('../../tools/utils');
const ensureFromJSImported = require('../global/ensureFromJsImported');

module.exports = ({
  file,
  cases: { pascal, camel, display },
  initialState,
  actions,
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
      return (
        b.slice(0, startIndex) + printObject(initialState) + b.slice(endIndex)
      );
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
        `const initial${pascal}State = fromJS(${printObject(initialState)});`,
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
    /** Adds actions */
    b => {
      if (!actions) {
        return b;
      }
      console.log(`Updating ${display} Actions in Reducer!`.white);
      const p = new Parser(b);
      p.resetTicker();
      p.toNext(`export const ${camel}Reducer =`);
      const searchTerm = `switch (type) {`;
      const startIndex = p.toNext(searchTerm).index + searchTerm.length;
      const { index: endIndex } = p.toNext('default:');
      let content = '';
      Object.keys(actions)
        .map(key => ({ ...actions[key], name: key }))
        .forEach(action => {
          const c = new Cases(parseCamelCaseToArray(action.name));
          const cases = c.all();

          const operations = writeActionsInReducer({
            action,
          });

          content += concat([`    case ${cases.constant}:`, operations, ``]);
        });
      return (
        concat([b.slice(0, startIndex), content]) + `    ` + b.slice(endIndex)
      );
    },
  ]);

  fs.writeFileSync(file, newBuffer);
};

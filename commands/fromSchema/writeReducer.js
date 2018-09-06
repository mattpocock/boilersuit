const Parser = require('../../tools/parser');
const Cases = require('../../tools/cases');
const writeActionsInReducer = require('./writeActionsInReducer');
const {
  concat,
  transforms,
  parseCamelCaseToArray,
  printObject,
  prettify,
  ensureImport,
} = require('../../tools/utils');

module.exports = ({
  buffer,
  cases: { pascal, camel, display },
  initialState,
  actions,
}) => {
  const newBuffer = transforms(buffer, [
    ensureImport('fromJS', 'immutable', { destructure: true }),
    /** Adds in boilerplate if domain does not exist */
    b => {
      const index = b.lastIndexOf('export default');
      console.log(`Writing ${display} Reducer!`.white);
      return concat([
        b.slice(0, index),
        `// @suit-start`,
        `/** ${display} Reducer */`,
        ``,
        `const initial${pascal}State = fromJS(${printObject(initialState)});`,
        ``,
        `export const ${camel}Reducer = (state = initial${pascal}State, { type, payload }) => {`,
        `  switch (type) {`,
        `    default:`,
        `      return state;`,
        `  }`,
        `};`,
        `// @suit-end`,
        ``,
        b.slice(index),
      ]);
    },
    /** Adds to combineReducers */
    b => {
      const searchTerm = 'combineReducers({';
      const index = b.indexOf(searchTerm) + searchTerm.length;
      return (
        concat([
          b.slice(0, index),
          `  ${camel}: ${camel}Reducer, // @suit-line`,
        ]) + b.slice(index)
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
    buf =>
      transforms(buf, [
        ...Object.keys(actions)
          .map(key => ({ ...actions[key], name: key }))
          .map(action => {
            const c = new Cases(parseCamelCaseToArray(action.name));
            const constant = c.constant();
            return ensureImport(constant, './constants', { destructure: true });
          }),
      ]),
    prettify,
  ]);

  return newBuffer;
};

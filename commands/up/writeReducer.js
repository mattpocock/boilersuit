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
  actionHasPayload,
} = require('../../tools/utils');

module.exports = ({
  buffer,
  cases: { pascal, camel, display },
  initialState,
  actions,
  describe,
}) =>
  transforms(buffer, [
    /** Adds in boilerplate if domain does not exist */
    ensureImport('fromJS', 'immutable', { destructure: true }),
    ensureImport('combineReducers', 'redux', { destructure: true }),
    b => {
      const index = b.lastIndexOf('export default');
      const hasPayload = actionHasPayload(actions);

      return concat([
        b.slice(0, index),
        `// @suit-start`,
        `/**`,
        ` * ${display} Reducer`,
        describe ? ` * - ${describe}` : null,
        ` */`,
        ``,
        `export const initial${pascal}State = fromJS(${printObject(initialState)});`,
        ``,
        `export const ${camel}Reducer = (state = initial${pascal}State, { type${
          hasPayload ? ', payload' : ''
        } }) => {`,
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

          content += concat([
            action.describe ? `    // ${action.describe}` : null,
            `    case ${cases.constant}:`,
            operations,
            ``,
          ]);
        });
      return (
        concat([b.slice(0, startIndex), content]) + `    ` + b.slice(endIndex)
      );
    },
    buf => {
      if (!actions) {
        return buf;
      }
      return transforms(buf, [
        ...Object.keys(actions)
          .map(key => ({ ...actions[key], name: key }))
          .map(action => {
            const c = new Cases(parseCamelCaseToArray(action.name));
            const constant = c.constant();
            return ensureImport(constant, './constants', { destructure: true });
          }),
      ]);
    },
    prettify,
  ]);

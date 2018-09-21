const Parser = require('../../../tools/parser');
const Cases = require('../../../tools/cases');
const writeActionsInReducer = require('./writeActionsInReducer');
const { concat, parseCamelCaseToArray } = require('../../../tools/utils');

module.exports = ({ camel, actions }) => buffer => {
  const p = new Parser(buffer);
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
    concat([buffer.slice(0, startIndex), content]) +
    `    ` +
    buffer.slice(endIndex)
  );
};

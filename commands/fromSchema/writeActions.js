const Cases = require('../../tools/cases');
const {
  concat,
  transforms,
  parseCamelCaseToArray,
} = require('../../tools/utils');

module.exports = ({ buffer, cases, actions }) =>
  transforms(buffer, [
    /** Adds the domain */
    b => concat([b, `// @suit-start`, ``, `/** ${cases.display} actions */`]),
    ...Object.keys(actions)
      .map(key => ({ name: key, ...actions[key] }))
      .reverse()
      .map(({ name, set }, i) => b => {
        const c = new Cases(parseCamelCaseToArray(name));
        const actionCases = c.all();

        const searchTerm = `/** ${cases.display} actions */`;
        const index = b.indexOf(searchTerm) + searchTerm.length;

        let content = '';
        if (Object.values(set).includes('payload')) {
          content += concat([
            ``,
            `export const ${actionCases.camel} = (payload) => ({`,
            `  type: ${actionCases.constant},`,
            `  payload,`,
            `});`,
          ]);
        } else {
          content += concat([
            ``,
            `export const ${actionCases.camel} = () => ({`,
            `  type: ${actionCases.constant},`,
            `});`,
          ]);
        }
        if (i === 0) {
          content += '\n\n// @suit-end';
        }

        return concat([b.slice(0, index), content, b.slice(index)]);
      }),
  ]);

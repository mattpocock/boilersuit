const Cases = require('../../tools/cases');
const {
  concat,
  transforms,
  parseCamelCaseToArray,
  ensureImport,
} = require('../../tools/utils');

module.exports = ({ buffer, cases, actions }) =>
  transforms(buffer, [
    /** Adds the domain */
    b => concat([b, `// @suit-start`, ``, `/** ${cases.display} actions */`]),
    /** Adds each action */
    ...Object.keys(actions)
      .map(key => ({ name: key, ...actions[key] }))
      .reverse()
      .map(({ name, set }, i) => b => {
        const c = new Cases(parseCamelCaseToArray(name));
        const actionCases = c.all();
        /** Ensures the imports of the constants */
        const newBuffer = ensureImport(actionCases.constant, './constants', {
          destructure: true,
        })(b);

        const searchTerm = `/** ${cases.display} actions */`;
        const index = newBuffer.indexOf(searchTerm) + searchTerm.length;

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

        return concat([newBuffer.slice(0, index), content, newBuffer.slice(index)]);
      }),
  ]);

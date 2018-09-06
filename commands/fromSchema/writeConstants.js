const Cases = require('../../tools/cases');
const {
  concat,
  transforms,
  parseCamelCaseToArray,
  prettify,
} = require('../../tools/utils');

module.exports = ({ buffer, cases, actions, folder }) =>
  transforms(buffer, [
    /** Adds the domain */
    b => concat([b, `// @suit-start`, ``, `/** ${cases.display} constants */`]),
    /** Adds each action */
    ...Object.keys(actions)
      .map(key => ({ name: key, ...actions[key] }))
      .reverse()
      .map(({ name }, i) => b => {
        const c = new Cases(parseCamelCaseToArray(name));
        const actionCases = c.all();

        const searchTerm = `/** ${cases.display} constants */`;
        const index = b.indexOf(searchTerm) + searchTerm.length;

        let content = '';
        content += concat([
          ``,
          `export const ${actionCases.constant} = `,
          `  '${folder}${actionCases.constant}';`,
        ]);
        if (i === 0) {
          content += '\n\n// @suit-end';
        }

        return concat([b.slice(0, index), content, b.slice(index)]);
      }),
    prettify,
  ]);

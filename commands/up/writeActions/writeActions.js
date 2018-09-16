const Cases = require('../../../tools/cases');
const {
  concat,
  transforms,
  parseCamelCaseToArray,
  ensureImport,
  prettify,
} = require('../../../tools/utils');

module.exports = ({ buffer, cases, actions }) =>
  transforms(buffer, [
    /** Adds the domain */
    b => concat([b, `// @suit-start`, ``, `/** ${cases.display} actions */`]),
    /** Adds each action */
    ...Object.keys(actions)
      .map(key => ({ name: key, ...actions[key] }))
      .reverse()
      .map(({ name, set, payload: payloadOverride, describe }, i) => b => {
        const c = new Cases(parseCamelCaseToArray(name));
        const actionCases = c.all();
        /** Ensures the imports of the constants */
        const newBuffer = ensureImport(actionCases.constant, './constants', {
          destructure: true,
        })(b);

        const searchTerm = `/** ${cases.display} actions */`;
        const index = newBuffer.indexOf(searchTerm) + searchTerm.length;

        let content = '';
        const hasPayload =
          Object.values(set).filter(
            value => `${value}`.indexOf('payload') !== -1,
          ).length > 0 || payloadOverride;
        content += concat([
          ``,
          describe ? `// ${describe}` : null,
          `export const ${actionCases.camel} = (${
            hasPayload ? 'payload' : ''
          }) => ({`,
          `  type: ${actionCases.constant},`,
          hasPayload ? `  payload,` : null,
          `});`,
        ]);
        if (i === 0) {
          content += '\n\n// @suit-end';
        }

        return concat([
          newBuffer.slice(0, index),
          content,
          newBuffer.slice(index),
        ]);
      }),
    prettify,
  ]);

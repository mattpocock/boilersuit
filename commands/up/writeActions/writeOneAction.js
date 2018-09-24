const Cases = require('../../../tools/cases');
const {
  concat,
  parseCamelCaseToArray,
  ensureImport,
} = require('../../../tools/utils');

/**
 * Writes one action to the file
 * @param {object} domainCases
 */
module.exports = domainCases => (
  { name, set, payload: payloadOverride, describe },
  i,
) => buffer => {
  const c = new Cases(parseCamelCaseToArray(name));
  const actionCases = c.all();
  /** Ensures the imports of the constants */
  const newBuffer = ensureImport(actionCases.constant, './constants', {
    destructure: true,
  })(buffer);

  const searchTerm = `/** ${domainCases.display} actions */`;
  const index = newBuffer.indexOf(searchTerm) + searchTerm.length;

  let content = '';
  const hasPayload =
    (set &&
      Object.values(set).filter(value => `${value}`.indexOf('payload') !== -1)
        .length > 0) ||
    payloadOverride;
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

  return concat([newBuffer.slice(0, index), content, newBuffer.slice(index)]);
};

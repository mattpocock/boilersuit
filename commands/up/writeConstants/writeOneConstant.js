const Cases = require('../../../tools/cases');
const { concat, parseCamelCaseToArray } = require('../../../tools/utils');

/** Writes one constant into the file */
module.exports = ({ cases, folder }) => ({ name }, i) => b => {
  const c = new Cases(parseCamelCaseToArray(name));
  const actionCases = c.all();

  const searchTerm = `/** ${cases.display} constants */`;
  const index = b.indexOf(searchTerm) + searchTerm.length;

  let content = '';
  content += concat([
    ``,
    `export const ${actionCases.constant} =`,
    `  '${folder}${actionCases.constant}';`,
  ]);
  if (i === 0) {
    content += '\n\n// @suit-end';
  }

  return concat([b.slice(0, index), content, b.slice(index)]);
};

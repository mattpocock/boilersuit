const Parser = require('../../tools/parser');
const { concat } = require('../../tools/utils');

module.exports = (buf, { pascal, constant, display }) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  const stringToInsert = concat([
    ``,
    `/** ${display} */`,
    ``,
    `export const change${pascal} = (value) => ({`,
    `  type: CHANGE_${constant},`,
    `  payload: value,`,
    `});`,
    ``,
  ]);

  const { index: importsIndex, prefix, suffix } = parser.getImportIndex(
    './constants',
  );
  const importsToInsert = concat([
    `${prefix || ''}CHANGE_${constant}${suffix || ''}`,
  ]);

  return (
    buffer.slice(0, importsIndex) +
    importsToInsert +
    buffer.slice(importsIndex) +
    stringToInsert
  );
};

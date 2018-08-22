const Parser = require('../tools/parser');
const { concat } = require('../tools/utils');

module.exports = (buf, { camel, constant, display }) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  const stringToInsert = concat([
    ``,
    `/** ${display} */`,
    ``,
    `export const ${camel}Started = () => ({`,
    `  type: ${constant}_STARTED,`,
    `});`,
    ``,
    `export const ${camel}Failed = () => ({`,
    `  type: ${constant}_FAILED,`,
    `});`,
    ``,
    `export const ${camel}Succeeded = () => ({`,
    `  type: ${constant}_SUCCEEDED,`,
    `});`,
    ``,
  ]);

  const { index: importsIndex, prefix, suffix } = parser.getImportIndex(
    './constants',
  );
  const importsToInsert = concat([
    `${prefix || ''}${constant}_STARTED,`,
    `  ${constant}_SUCCEEDED,`,
    `  ${constant}_FAILED${suffix || ''}`,
  ]);

  return (
    buffer.slice(0, importsIndex) +
    importsToInsert +
    buffer.slice(importsIndex) +
    stringToInsert
  );
};

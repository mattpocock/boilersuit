const { concat, transforms } = require('../../../tools/utils');
const Parser = require('../../../tools/parser');
const ensureFromJsImported = require('../../global/ensureFromJsImported');

module.exports = (buf, { pascal, camel }, { pascal: domainPascal }) => {
  const buffer = transforms(buf.toString(), [
    ensureFromJsImported,
  ]);
  const parser = new Parser(buffer);

  parser.toNext(`export const makeSelect${domainPascal} = () =>`);
  const { index } = parser.toNext(`;`);
  parser.resetTicker();

  const selectorIndex = index + 1;

  const selectorToInsert = concat([
    ``,
    `export const makeSelect${domainPascal}${pascal} = () =>`,
    `  createSelector(makeSelect${domainPascal}(), (substate) => substate.get('${camel}'));`,
  ]);

  return (
    buffer.slice(0, selectorIndex) +
    selectorToInsert +
    buffer.slice(selectorIndex)
  );
};

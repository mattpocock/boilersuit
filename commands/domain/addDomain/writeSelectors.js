const { concat, transforms } = require('../../../tools/utils');
const Parser = require('../../../tools/parser');
const ensureFromJsImported = require('../../global/ensureFromJsImported');

module.exports = (buf, { display, pascal, camel }) => {
  const buffer = transforms(buf.toString(), [ensureFromJsImported]);
  const parser = new Parser(buffer);

  // If already here, don't change a thing
  if (parser.includes(`export const makeSelect${pascal} = () =>`)) {
    console.log(`Domain '${display}' already present in './selectors'!`.yellow);
    return buffer;
  }

  return concat([
    buf.toString(),
    `/**`,
    ` * ${display}`,
    ` */`,
    ``,
    `export const makeSelect${pascal} = () =>`,
    `  createSelector(selectDomain, (substate) => fromJS(substate.${camel}));`,
    ``,
  ]);
};

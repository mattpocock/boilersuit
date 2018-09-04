const { concat } = require('../../../tools/utils');
const Parser = require('../../../tools/parser');

module.exports = (buf, { display, pascal, camel }) => {
  const buffer = buf.toString();
  const parser = new Parser(buffer);

  // If already here, don't change a thing
  if (parser.includes(`export const makeSelect${pascal} = () =>`)) {
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

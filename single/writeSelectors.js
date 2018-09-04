const { concat } = require('../tools/utils');

module.exports = (buf, { display, pascal, camel }) => concat([
  buf.toString(),
  `/**`,
  ` * ${display}`,
  ` */`,
  ``,
  `export const makeSelect${pascal}Domain = () =>`,
  `  createSelector(selectDomain, (substate) => fromJS(substate.${camel}));`,
  `export const makeSelect${pascal} = () =>`,
  `  createSelector(makeSelect${pascal}Domain(), (substate) => substate.get('value'));`,
  ``,
]);

const { concat } = require('../tools/utils');

module.exports = (buf, { display, pascal, camel }) =>
  concat([
    buf.toString(),
    '',
    `/**`,
    ` * ${display}`,
    ` */`,
    ``,
    `export const makeSelect${pascal} = () =>`,
    `  createSelector(selectDomain, (substate) => fromJS(substate.${camel}));`,
    `export const makeSelectIs${pascal}Loading = () =>`,
    `  createSelector(makeSelect${pascal}(), (substate) => substate.get('isLoading'));`,
    `export const makeSelect${pascal}HasFailed = () =>`,
    `  createSelector(makeSelect${pascal}(), (substate) => substate.get('hasError'));`,
    `export const makeSelect${pascal}HasSucceeded = () =>`,
    `  createSelector(makeSelect${pascal}(), (substate) => substate.get('hasSucceeded'));`,
    `export const makeSelect${pascal}Data = () =>`,
    `  createSelector(makeSelect${pascal}(), (substate) => substate.get('${camel}Data'));`,
    `export const makeSelect${pascal}ErrorMessage = () =>`,
    `  createSelector(makeSelect${pascal}(), (substate) => substate.get('${camel}errorMessage'));`,
    ``,
  ]);

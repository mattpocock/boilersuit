const writeReducerTests = require('./writeReducerTests');
const Cases = require('../../../tools/cases');
const {
  parseCamelCaseToArray,
  cleanFile,
  fixInlineImports,
  transforms,
} = require('../../../tools/utils');

module.exports = ({ buffer, arrayOfDomains }) =>
  transforms(buffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, initialState, actions }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();

      return writeReducerTests({
        buffer: b,
        cases: allDomainCases,
        actions,
        initialState,
      });
    }),
  ]);

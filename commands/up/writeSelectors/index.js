const writeSelectors = require('./writeSelectors');
const Cases = require('../../../tools/cases');
const {
  parseCamelCaseToArray,
  cleanFile,
  fixInlineImports,
  transforms,
} = require('../../../tools/utils');

module.exports = ({ arrayOfDomains, folder, buffer }) =>
  transforms(buffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, initialState }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();

      return writeSelectors({
        buffer: b,
        cases: allDomainCases,
        initialState,
        folder,
      });
    }),
  ]);

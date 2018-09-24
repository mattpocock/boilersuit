const writeSelectorTests = require('./writeSelectorTests');
const Cases = require('../../../tools/cases');
const {
  parseCamelCaseToArray,
  cleanFile,
  fixInlineImports,
  transforms,
} = require('../../../tools/utils');

module.exports = ({ buffer, arrayOfDomains, folder }) =>
  transforms(buffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, initialState }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName)).all();

      return writeSelectorTests({
        buffer: b,
        cases,
        initialState,
        folder,
      });
    }),
  ]);

const fs = require('fs');
const writeConstants = require('./writeConstants');
const Cases = require('../../../tools/cases');
const {
  transforms,
  cleanFile,
  fixInlineImports,
  parseCamelCaseToArray,
} = require('../../../tools/utils');

module.exports = ({ folder, arrayOfDomains }) => {
  const constantsBuffer = fs.readFileSync(`${folder}/constants.js`).toString();

  const newConstantsBuffer = transforms(constantsBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, actions }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();

      return writeConstants({
        buffer: b,
        cases: allDomainCases,
        actions,
        folder,
      });
    }),
  ]);
  return { buffer: newConstantsBuffer };
};

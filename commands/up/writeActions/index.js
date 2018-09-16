const fs = require('fs');
const writeActions = require('./writeActions');
const Cases = require('../../../tools/cases');
const {
  transforms,
  cleanFile,
  fixInlineImports,
  parseCamelCaseToArray,
} = require('../../../tools/utils');

module.exports = ({ folder, arrayOfDomains }) => {
  const actionsBuffer = fs.readFileSync(`${folder}/actions.js`).toString();

  const newActionsBuffer = transforms(actionsBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, actions }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();

      return writeActions({
        buffer: b,
        cases: allDomainCases,
        actions,
      });
    }),
  ]);
  return { buffer: newActionsBuffer };
};

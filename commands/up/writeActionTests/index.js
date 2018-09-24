const writeActionTests = require('./writeActionTests');
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

      const arrayOfActions = Object.keys(actions).map(key => ({
        ...actions[key],
        name: key,
        cases: new Cases(parseCamelCaseToArray(key)).all(),
      }));

      return writeActionTests({
        buffer: b,
        domainCases: allDomainCases,
        arrayOfActions,
        initialState,
      });
    }),
  ]);

const colors = require('colors'); // eslint-disable-line
const writeIndex = require('./writeIndex');
const writeImportsToIndex = require('./writeImportsToIndex');
const Cases = require('../../../tools/cases');
const {
  parseCamelCaseToArray,
  cleanFile,
  fixInlineImports,
  transforms,
} = require('../../../tools/utils');

module.exports = ({ indexBuffer, arrayOfDomains, keyChanges = [], imports }) =>
  transforms(indexBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains
      .filter(({ mapToContainer }) => mapToContainer !== false)
      .map(({ domainName, actions, initialState }) => b => {
        const cases = new Cases(parseCamelCaseToArray(domainName));
        const allDomainCases = cases.all();

        return writeIndex({
          buffer: b,
          cases: allDomainCases,
          initialState,
          keyChanges,
          actions,
        });
      }),
    b =>
      writeImportsToIndex({
        imports,
        buffer: b,
      }),
  ]);

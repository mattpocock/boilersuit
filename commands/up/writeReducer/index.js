const writeOneReducer = require('./writeOneReducer');
const Cases = require('../../../tools/cases');
const {
  transforms,
  cleanFile,
  fixInlineImports,
  parseCamelCaseToArray,
} = require('../../../tools/utils');
const checkIfDomainAlreadyPresent = require('../../../tools/checkIfDomainAlreadyPresent');

module.exports = ({
  folder,
  arrayOfDomains,
  buffer,
  checkForErrors = true,
  keyChanges,
}) => {
  /** Write Reducers */
  let domainErrors = [];
  const newReducerBuffer = transforms(buffer, [
    cleanFile,
    fixInlineImports,
    /** Writes a reducer for each domain */
    ...arrayOfDomains
      .filter(({ domainName }) => {
        const buf = cleanFile(buffer);
        return buf.indexOf(`export const ${domainName}Reducer`) === -1;
      })
      .map(({ domainName, initialState, actions, describe }) => b => {
        const cases = new Cases(parseCamelCaseToArray(domainName));
        const allDomainCases = cases.all();
        if (checkForErrors) {
          domainErrors = [
            ...domainErrors,
            ...checkIfDomainAlreadyPresent(folder, allDomainCases, actions),
          ];
        }

        return writeOneReducer({
          buffer: b,
          cases: allDomainCases,
          initialState,
          actions,
          keyChanges,
          describe,
        });
      }),
  ]);
  return {
    buffer: newReducerBuffer,
    errors: domainErrors,
  };
};

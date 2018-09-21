const fs = require('fs');
const writeOneReducer = require('./writeOneReducer');
const Cases = require('../../../tools/cases');
const {
  transforms,
  cleanFile,
  fixInlineImports,
  parseCamelCaseToArray,
} = require('../../../tools/utils');
const checkIfDomainAlreadyPresent = require('../../../tools/checkIfDomainAlreadyPresent');

module.exports = ({ folder, arrayOfDomains }) => {
  /** Write Reducers */
  const reducersFile = `${folder}/reducer.js`;
  const reducerBuffer = cleanFile(fs.readFileSync(reducersFile).toString());
  let domainErrors = [];
  const newReducerBuffer = transforms(reducerBuffer, [
    cleanFile,
    fixInlineImports,
    /** Writes a reducer for each domain */
    ...arrayOfDomains.map(
      ({ domainName, initialState, actions, describe }) => b => {
        const cases = new Cases(parseCamelCaseToArray(domainName));
        const allDomainCases = cases.all();
        domainErrors = [
          ...domainErrors,
          ...checkIfDomainAlreadyPresent(folder, allDomainCases, actions),
        ];

        return writeOneReducer({
          buffer: b,
          cases: allDomainCases,
          initialState,
          actions,
          describe,
        });
      },
    ),
  ]);
  return {
    buffer: newReducerBuffer,
    errors: domainErrors,
  };
};

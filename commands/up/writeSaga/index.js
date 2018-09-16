const fs = require('fs');
const writeSaga = require('./writeSaga');
const Cases = require('../../../tools/cases');
const {
  transforms,
  cleanFile,
  fixInlineImports,
  parseCamelCaseToArray,
  concat,
} = require('../../../tools/utils');
const printError = require('../../../tools/printError');
const checkIfNoAllSagas = require('../../../tools/checkIfNoAllSagas');

module.exports = ({ folder, arrayOfDomains }) => {
  const sagaBuffer = fs.readFileSync(`${folder}/saga.js`).toString();

  const sagaErrors = checkIfNoAllSagas(sagaBuffer);
  return {
    errors: sagaErrors,
    buffer: sagaErrors.length
      ? null
      : transforms(sagaBuffer, [
          cleanFile,
          fixInlineImports,
          ...arrayOfDomains.map(({ domainName, actions }) => buffer => {
            const cases = new Cases(parseCamelCaseToArray(domainName));
            const allDomainCases = cases.all();
            const actionsWithSagas = Object.keys(actions).filter(
              key => actions[key].saga === true,
            );
            if (actionsWithSagas > 1) {
              printError([
                concat([
                  `More than one action in ${
                    allDomainCases.display
                  } has been given an attribute of "saga": true`,
                  `- Only one action can be assigned a saga per reducer.`,
                ]),
              ]);
              return buffer;
            }

            if (actionsWithSagas < 1) {
              return buffer;
            }

            const actionCases = new Cases(
              parseCamelCaseToArray(actionsWithSagas[0]),
            );
            const allActionCases = actionCases.all();

            return writeSaga({
              buffer,
              cases: allDomainCases,
              actionCases: allActionCases,
              action: actions[actionsWithSagas[0]],
            });
          }),
        ]),
  };
};

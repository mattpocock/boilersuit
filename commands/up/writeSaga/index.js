const fs = require('fs');
const writeSaga = require('./writeSaga');
const writeNameControlSaga = require('./writeNameControlSaga');
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

module.exports = ({ folder, arrayOfDomains, keyChanges }) => {
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
              key => typeof actions[key].saga !== 'undefined',
            );
            if (actionsWithSagas > 1) {
              printError([
                concat([
                  `More than one action in ${
                    allDomainCases.display
                  } has been given a saga`,
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
            ).all();
            const actionObject = actions[actionCases.camel];

            if (actionObject.saga === true) {
              return writeSaga({
                buffer,
                cases: allDomainCases,
                actionCases,
                action: actionObject,
              });
            }

            if (actionObject.saga.onFail && actionObject.saga.onSuccess) {
              return writeNameControlSaga({
                buffer,
                domainCases: allDomainCases,
                action: actionObject,
                actionCases,
                failCases: new Cases(
                  parseCamelCaseToArray(actionObject.saga.onFail),
                ).all(),
                successCases: new Cases(
                  parseCamelCaseToArray(actionObject.saga.onSuccess),
                ).all(),
                keyChanges,
              });
            }
            if (!actionObject.saga.onFail) {
              printError(
                concat([
                  `The saga in ${
                    actionCases.display
                  } does not have an 'onFail' key.`,
                  `- This means it won't report an error when it fails.`,
                  `- try this:`,
                  `- {`,
                  `-   "saga": {`,
                  `-     "onFail": "actionToFireOnFail"`,
                  `-   }`,
                  `- }`,
                ]),
              );
            }
            if (!actionObject.saga.onFail) {
              printError(
                concat([
                  `The saga in ${
                    actionCases.display
                  } does not have an 'onSuccess' key.`,
                  `- This means it won't report an error when it fails.`,
                  `- try this:`,
                  `- {`,
                  `-   "saga": {`,
                  `-     "onSuccess": "actionToFireOnSuccess"`,
                  `-   }`,
                  `- }`,
                ]),
              );
            }
            return buffer;
          }),
        ]),
  };
};

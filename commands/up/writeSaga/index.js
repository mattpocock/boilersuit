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
const checkIfNoAllSagas = require('../../../tools/checkIfNoAllSagas');

module.exports = ({ sagaBuffer, arrayOfDomains, keyChanges }) => {
  let sagaErrors = checkIfNoAllSagas(sagaBuffer);
  let sagaMessages = [];
  const newBuffer = transforms(sagaBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, actions }) => buffer => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();
      const actionsWithSagas = Object.keys(actions).filter(
        key => typeof actions[key].saga !== 'undefined',
      );
      if (actionsWithSagas > 1) {
        sagaErrors.push(
          concat([
            `More than one action in ${
              allDomainCases.display
            } has been given a saga`,
            `- Only one action can be assigned a saga per reducer.`,
          ]),
        );
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
        const {
          buffer: uncontrolledSagaBuffer,
          errors: uncontrolledSagaErrors,
          messages: uncontrolledSagaMessages,
        } = writeSaga({
          buffer,
          cases: allDomainCases,
          actionCases,
          action: actionObject,
        });
        sagaErrors = [...sagaErrors, ...uncontrolledSagaErrors];
        sagaMessages = [...sagaMessages, ...uncontrolledSagaMessages];
        return uncontrolledSagaBuffer;
      }

      if (!actionObject.saga.onFail) {
        sagaErrors.push(
          concat([
            `The saga in ${actionCases.display} does not have an 'onFail' key.`,
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
        sagaErrors.push(
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
      if (actionObject.saga.onFail && actionObject.saga.onSuccess) {
        const {
          buffer: nameControlBuffer,
          errors: nameControlErrors,
          messages: nameControlMessages,
        } = writeNameControlSaga({
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
        sagaMessages = [...sagaMessages, ...nameControlMessages];
        sagaErrors = [...sagaErrors, ...nameControlErrors];
        return nameControlBuffer;
      }
      return buffer;
    }),
  ]);
  return {
    buffer: newBuffer,
    messages: sagaMessages,
    errors: sagaErrors,
  };
};

const writeIndex = require('./writeIndex');
const writeSelectors = require('./writeSelectors');
const writeActions = require('./writeActions');
const writeConstants = require('./writeConstants');
const writeReducer = require('./writeReducer');
const writeSaga = require('./writeSaga');
const writeReducerTests = require('./writeReducerTests');
const writeActionTests = require('./writeActionTests');
const writeSelectorTests = require('./writeSelectorTests');
const checkIfBadBuffer = require('../../tools/checkIfBadBuffer');
const checkErrorsInSchema = require('../../tools/checkErrorsInSchema');
const checkWarningsInSchema = require('../../tools/checkWarningsInSchema');
const detectDiff = require('./detectDiff');
const reservedKeywords = require('../../tools/constants/reservedKeywords');

module.exports = ({
  schema,
  errors: passedErrors = [],
  folder,
  dotSuitFolder,
  buffers,
  config = {},
  newSchemaBuf,
}) => {
  let errors = passedErrors;
  const arrayOfDomains = Object.keys(schema)
    .filter(key => !reservedKeywords.includes(key))
    .map(key => ({
      ...schema[key],
      domainName: key,
    }));

  errors = [
    ...errors,
    ...checkErrorsInSchema(schema, folder),
    ...checkIfBadBuffer(buffers),
  ];

  if (errors.length) {
    return { errors, shouldContinue: false };
  }

  const warnings = checkWarningsInSchema(schema, config);

  /** Get a more detailed diff of the changes */
  const keyChanges = detectDiff({
    dotSuitFolder,
    schemaBuf: newSchemaBuf,
  });

  /** Write reducer */
  const { buffer: newReducerBuffer, errors: domainErrors } = writeReducer({
    folder,
    arrayOfDomains,
    keyChanges,
    buffer: buffers.reducer,
  });

  if (domainErrors.length) {
    return { errors: domainErrors, warnings, shouldContinue: false };
  }

  /** Write Actions */
  const { buffer: newActionsBuffer } = writeActions({
    buffer: buffers.actions,
    arrayOfDomains,
  });

  /** Write Constants */
  const { buffer: newConstantsBuffer } = writeConstants({
    folder,
    arrayOfDomains,
    buffer: buffers.constants,
  });

  /** Write Selectors */
  const newSelectorsBuffer = writeSelectors({
    buffer: buffers.selectors,
    folder,
    arrayOfDomains,
  });

  /** Write Index */
  const newIndexBuffer = writeIndex({
    indexBuffer: buffers.index,
    arrayOfDomains,
    keyChanges,
  });

  /** Write Saga */
  const saga = writeSaga({
    sagaBuffer: buffers.saga,
    arrayOfDomains,
    keyChanges,
  });
  if (saga.errors.length) {
    return { errors, shouldContinue: false };
  }

  /** Write reducer tests */
  const newReducerTestBuffer = writeReducerTests({
    buffer: buffers.reducerTests,
    arrayOfDomains,
  });

  /** Write actions tests */
  const newActionTestsBuffer = writeActionTests({
    buffer: buffers.actionTests,
    arrayOfDomains,
  });

  /** Write selectors tests */
  const newSelectorsTestsBuffer = writeSelectorTests({
    buffer: buffers.selectorsTests,
    arrayOfDomains,
    folder,
  });

  return {
    shouldContinue: true,
    saga,
    newReducerBuffer,
    newReducerTestBuffer,
    newSelectorsTestsBuffer,
    newActionTestsBuffer,
    newIndexBuffer,
    newSelectorsBuffer,
    newConstantsBuffer,
    newActionsBuffer,
    warnings,
    errors,
    messages: [],
  };
};

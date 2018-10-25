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
const checkForChanges = require('./checkForChanges');
const checkForDebrisInNameOnly = require('./checkForDebrisInNameOnly');
const { concat } = require('../../tools/utils');

module.exports = ({
  schema,
  errors: passedErrors = [],
  folder,
  dotSuitFolder,
  buffers,
  config = {},
  newSchemaBuf,
  imports,
  quiet,
  force,
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

  let warnings = checkWarningsInSchema(schema, config);

  /** Check for a previous suit file in folder - force prevents this check */
  const {
    shouldContinue: anyChanges,
    messages: changeMessages,
  } = checkForChanges({
    dotSuitFolder,
    quiet,
    force,
    schemaBuf: newSchemaBuf,
  });
  if (!anyChanges) {
    return {
      shouldContinue: false,
      messages: changeMessages,
      warnings,
      errors,
    };
  }

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

  warnings = [
    ...warnings,
    ...checkForDebrisInNameOnly({
      buffer: newReducerBuffer,
      searchTerms: ['export const', 'Reducer'],
      trimFunction: line =>
        line
          .split(' ')
          .find(word => word.includes('Reducer'))
          .replace('Reducer', ''),
      domains: arrayOfDomains,
    }).map(domain =>
      concat([
        `Useless code in reducers file`,
        `Found:`,
        domain.map(dom => ` - ` + `${dom}`.cyan + ` Reducer`),
        `Remove this, otherwise you'll get errors`,
      ]),
    ),
  ];

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
    imports,
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

  warnings = [
    ...warnings,
    ...checkForDebrisInNameOnly({
      buffer: saga.buffer,
      searchTerms: ['function*'],
      domains: arrayOfDomains,
      // This trims the line from 'function* getNotes({ })'... to 'getNotes'
      trimFunction: line =>
        line
          .replace('function*', '')
          .replace(' ', '')
          .split('(')[0],
    }).map(domain =>
      concat([
        `Useless code in saga file`,
        `Found:`,
        domain.map(dom => ` - ` + `${dom}`.cyan + ` Saga`),
        `Remove this, otherwise you'll get errors`,
      ]),
    ),
  ];

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

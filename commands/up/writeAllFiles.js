const fs = require('fs');
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
const checkForConfigFile = require('./checkForConfigFile');
const checkForChanges = require('./checkForChanges');
const detectDiff = require('./detectDiff');
const { cleanFile } = require('../../tools/utils');

module.exports = ({
  schema,
  errors: passedErrors = [],
  folder,
  dotSuitFolder,
  quiet,
  force,
}) => {
  let errors = passedErrors;
  const arrayOfDomains = Object.keys(schema)
    .filter(
      key =>
        ![
          // Add keys to this list to reserve them
          'compose',
        ].includes(key),
    )
    .map(key => ({
      ...schema[key],
      domainName: key,
    }));

  errors = [
    ...errors,
    ...checkErrorsInSchema(schema, folder),
    ...checkIfBadBuffer(folder),
  ];

  if (errors.length) {
    return { errors, shouldContinue: false };
  }

  const config = checkForConfigFile();

  const warnings = checkWarningsInSchema(schema, config);

  const newSchemaBuf = JSON.stringify(schema, null, 2);

  // If no .suit folder exists, create one
  if (!fs.existsSync('./.suit')) {
    fs.mkdirSync('./.suit');
  }

  /** Check for a previous suit file in folder - force prevents this check */
  const { shouldContinue, messages } = checkForChanges({
    dotSuitFolder,
    quiet,
    force,
    schemaBuf: newSchemaBuf,
  });
  if (!shouldContinue) return { errors, warnings, messages, shouldContinue };

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
    buffer: cleanFile(fs.readFileSync(`${folder}/reducer.js`).toString()),
  });

  if (domainErrors.length) {
    return { errors: domainErrors, warnings, messages, shouldContinue: false };
  }

  /** Write Actions */
  const { buffer: newActionsBuffer } = writeActions({
    buffer: fs.readFileSync(`${folder}/actions.js`).toString(),
    arrayOfDomains,
  });

  /** Write Constants */
  const { buffer: newConstantsBuffer } = writeConstants({
    folder,
    arrayOfDomains,
    buffer: fs.readFileSync(`${folder}/constants.js`).toString(),
  });

  /** Write Selectors */
  const newSelectorsBuffer = writeSelectors({
    buffer: fs.readFileSync(`${folder}/selectors.js`).toString(),
    folder,
    arrayOfDomains,
  });

  /** Write Index */
  const newIndexBuffer = writeIndex({
    indexBuffer: fs.readFileSync(`${folder}/index.js`).toString(),
    arrayOfDomains,
    keyChanges,
  });

  /** Write Saga */
  const saga = writeSaga({
    sagaBuffer: fs.readFileSync(`${folder}/saga.js`).toString(),
    arrayOfDomains,
    keyChanges,
  });
  if (saga.errors.length) {
    return { errors, shouldContinue: false };
  }

  /** Write reducer tests */
  const newReducerTestBuffer = writeReducerTests({
    buffer: fs.existsSync(`${folder}/tests/reducer.test.js`)
      ? fs.readFileSync(`${folder}/tests/reducer.test.js`).toString()
      : '',
    arrayOfDomains,
  });

  /** Write actions tests */
  const newActionTestsBuffer = writeActionTests({
    buffer: fs.existsSync(`${folder}/tests/actions.test.js`)
      ? fs.readFileSync(`${folder}/tests/actions.test.js`).toString()
      : '',
    arrayOfDomains,
  });

  /** Write selectors tests */
  const newSelectorsTestsBuffer = writeSelectorTests({
    buffer: fs.existsSync(`${folder}/tests/selectors.test.js`)
      ? fs.readFileSync(`${folder}/tests/selectors.test.js`).toString()
      : '',
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
    newSchemaBuf,
    warnings,
    errors,
    messages,
  };
};

const colors = require('colors'); // eslint-disable-line
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
const checkExtends = require('./checkExtends');
const printError = require('../../tools/printError');
const printWarning = require('../../tools/printWarning');
const printMessages = require('../../tools/printMessages');
const checkIfBadBuffer = require('../../tools/checkIfBadBuffer');
const checkErrorsInSchema = require('../../tools/checkErrorsInSchema');
const checkWarningsInSchema = require('../../tools/checkWarningsInSchema');
const checkForConfigFile = require('./checkForConfigFile');
const checkForChanges = require('./checkForChanges');
const detectDiff = require('./detectDiff');
const runPrettier = require('./runPrettier');
const { cleanFile, concat } = require('../../tools/utils');

const up = (schemaFile, { quiet = false, force = false } = {}, watcher) => {
  /** If this is not a suit.json file, return */
  if (!schemaFile.includes('suit.json')) return;
  fs.readFile(schemaFile, (err, s) => {
    let errors = [];
    const schemaBuf = s.toString();
    /** Gives us the folder where the schema file lives */
    const folder = schemaFile
      .slice(0, -9)
      // This replaces all backslashes with forward slashes on Windows
      .replace(/\\/g, '/');
    const dotSuitFolder = folder.replace(/\//g, '-');

    let schema;
    try {
      schema = JSON.parse(schemaBuf.toString());
    } catch (e) {
      console.log('Error: ', e);
      return;
    }

    let extendsFound = checkExtends({
      arrayOfDomains: Object.keys(schema).map(key => ({
        ...schema[key],
        domainName: key,
      })),
      folder,
      schemaFile,
      schemaBuf,
    });

    if (extendsFound) return;

    /** Look for a compose object on the schema */
    if (schema.compose && schema.compose.length) {
      /** For each of the 'compose' array */
      schema.compose.forEach(c => {
        const file = `${c}`.includes('.json') ? c : `${c}.json`;
        if (fs.existsSync(`${folder}/${file}`)) {
          const buf = fs.readFileSync(`${folder}/${file}`).toString();
          const otherSchema = JSON.parse(buf);
          schema = {
            ...schema,
            ...otherSchema,
          };

          extendsFound =
            extendsFound ||
            checkExtends({
              arrayOfDomains: Object.keys(otherSchema).map(key => ({
                ...otherSchema[key],
                domainName: key,
              })),
              folder,
              schemaFile: `${folder}/${file}`,
              schemaBuf: buf,
            });
          // Adds it to the watcher
          const allWatchedPaths = Object.values(watcher.watched()).reduce(
            (a, b) => [...a, ...b],
            [],
          );
          if (!allWatchedPaths.includes(`${folder}${file}`)) {
            watcher.add(`${folder}${file}`);
          }
        } else {
          errors.push(concat([`Could not find suit.json file ` + `${c}`.cyan]));
        }
      });
    }

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

    if (extendsFound) return;

    errors = [
      ...errors,
      ...checkErrorsInSchema(schema, folder),
      ...checkIfBadBuffer(folder),
    ];

    if (errors.length) {
      console.log(`\n ${folder}suit.json `.white.bgRed);
      printError(errors);
      return;
    }

    const config = checkForConfigFile();

    const warnings = checkWarningsInSchema(schema, config);

    const newSchemaBuf = JSON.stringify(schema, null, 2);

    // If no .suit folder exists, create one
    if (!fs.existsSync('./.suit')) {
      fs.mkdirSync('./.suit');
    }

    /** Check for a previous suit file in folder - force prevents this check */
    const shouldContinue = checkForChanges({
      dotSuitFolder,
      quiet,
      force,
      folder,
      schemaBuf: newSchemaBuf,
      warnings,
    });
    if (!shouldContinue) return;

    if (warnings.length) {
      console.log(`\n ${folder}suit.json `.bgYellow.black);
    } else {
      console.log(`\n ${folder}suit.json `.bgGreen.black);
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
      buffer: cleanFile(fs.readFileSync(`${folder}/reducer.js`).toString()),
    });

    if (domainErrors.length) {
      printError(domainErrors);
      return;
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
      printError(saga.errors);
      return;
    }
    if (saga.messages.length) printMessages(saga.messages);

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

    printMessages([
      '\nCHANGES:'.green,
      '- writing reducers',
      '- writing reducer tests',
      '- writing actions',
      '- writing action tests',
      '- writing constants',
      '- writing selectors',
      '- writing selectors tests',
      '- writing index',
      '- writing saga',
      '- saving old suit file in .suit directory',
    ]);
    fs.writeFileSync(`${folder}/reducer.js`, newReducerBuffer);
    fs.writeFileSync(`${folder}/tests/reducer.test.js`, newReducerTestBuffer);
    fs.writeFileSync(`${folder}/actions.js`, newActionsBuffer);
    fs.writeFileSync(`${folder}/tests/actions.test.js`, newActionTestsBuffer);
    fs.writeFileSync(`${folder}/constants.js`, newConstantsBuffer);
    fs.writeFileSync(`${folder}/selectors.js`, newSelectorsBuffer);
    fs.writeFileSync(
      `${folder}/tests/selectors.test.js`,
      newSelectorsTestsBuffer,
    );
    fs.writeFileSync(`${folder}/index.js`, newIndexBuffer);
    fs.writeFileSync(`${folder}/saga.js`, saga.buffer);
    if (!fs.existsSync(`./.suit/${dotSuitFolder}`)) {
      fs.mkdirSync(`./.suit/${dotSuitFolder}`);
    }
    fs.writeFileSync(`./.suit/${dotSuitFolder}/suit.old.json`, newSchemaBuf);

    /** Runs prettier and checks for prettier warnings */
    const prettierWarnings = runPrettier(folder);

    printWarning([...warnings, ...prettierWarnings]);
  });
};

module.exports = up;

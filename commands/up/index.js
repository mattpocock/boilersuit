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
const Cases = require('../../tools/cases');
const {
  parseCamelCaseToArray,
  cleanFile,
  fixInlineImports,
  transforms,
  concat,
} = require('../../tools/utils');

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
      buffer: cleanFile(fs.readFileSync(`${folder}/reducer.js`).toString()),
    });

    if (domainErrors.length) {
      printError(domainErrors);
      return;
    }

    /** Write Actions */
    const { buffer: newActionsBuffer } = writeActions({
      folder,
      arrayOfDomains,
    });

    /** Write Constants */
    const { buffer: newConstantsBuffer } = writeConstants({
      folder,
      arrayOfDomains,
    });

    /** Write Selectors */
    const selectorsBuffer = fs
      .readFileSync(`${folder}/selectors.js`)
      .toString();

    const newSelectorsBuffer = transforms(selectorsBuffer, [
      cleanFile,
      fixInlineImports,
      ...arrayOfDomains.map(({ domainName, initialState }) => b => {
        const cases = new Cases(parseCamelCaseToArray(domainName));
        const allDomainCases = cases.all();

        return writeSelectors({
          buffer: b,
          cases: allDomainCases,
          initialState,
          folder,
        });
      }),
    ]);

    /** Write Index */
    const indexBuffer = fs.readFileSync(`${folder}/index.js`).toString();

    const newIndexBuffer = writeIndex({
      indexBuffer,
      arrayOfDomains,
      keyChanges,
    });

    /** Write Saga */
    const saga = writeSaga({
      folder,
      arrayOfDomains,
      keyChanges,
    });

    if (saga.errors.length) {
      printError(saga.errors);
      return;
    }

    if (saga.messages.length) {
      printMessages(saga.messages);
    }

    /** Write reducer tests */
    const reducerTestsBuffer = fs.existsSync(`${folder}/tests/reducer.test.js`)
      ? fs.readFileSync(`${folder}/tests/reducer.test.js`).toString()
      : '';

    const newReducerTestBuffer = transforms(reducerTestsBuffer, [
      cleanFile,
      fixInlineImports,
      ...arrayOfDomains.map(({ domainName, initialState, actions }) => b => {
        const cases = new Cases(parseCamelCaseToArray(domainName));
        const allDomainCases = cases.all();

        return writeReducerTests({
          buffer: b,
          cases: allDomainCases,
          actions,
          initialState,
        });
      }),
    ]);

    /** Write actions tests */
    const actionTestsBuffer = fs.existsSync(`${folder}/tests/actions.test.js`)
      ? fs.readFileSync(`${folder}/tests/actions.test.js`).toString()
      : '';

    const newActionTestsBuffer = transforms(actionTestsBuffer, [
      cleanFile,
      fixInlineImports,
      ...arrayOfDomains.map(({ domainName, initialState, actions }) => b => {
        const cases = new Cases(parseCamelCaseToArray(domainName));
        const allDomainCases = cases.all();

        const arrayOfActions = Object.keys(actions).map(key => ({
          ...actions[key],
          name: key,
          cases: new Cases(parseCamelCaseToArray(key)).all(),
        }));

        return writeActionTests({
          buffer: b,
          domainCases: allDomainCases,
          arrayOfActions,
          initialState,
        });
      }),
    ]);

    /** Write selectors tests */
    const selectorsTestsBuffer = fs.existsSync(
      `${folder}/tests/selectors.test.js`,
    )
      ? fs.readFileSync(`${folder}/tests/selectors.test.js`).toString()
      : '';

    const newSelectorsTestsBuffer = transforms(selectorsTestsBuffer, [
      cleanFile,
      fixInlineImports,
      ...arrayOfDomains.map(({ domainName, initialState }) => b => {
        const cases = new Cases(parseCamelCaseToArray(domainName)).all();

        return writeSelectorTests({
          buffer: b,
          cases,
          initialState,
          folder,
        });
      }),
    ]);

    console.log('\nCHANGES:'.green);

    console.log('- writing reducers');
    fs.writeFileSync(`${folder}/reducer.js`, newReducerBuffer);

    console.log('- writing reducer tests');
    fs.writeFileSync(`${folder}/tests/reducer.test.js`, newReducerTestBuffer);

    console.log('- writing actions');
    fs.writeFileSync(`${folder}/actions.js`, newActionsBuffer);

    console.log('- writing action tests');
    fs.writeFileSync(`${folder}/tests/actions.test.js`, newActionTestsBuffer);

    console.log('- writing constants');
    fs.writeFileSync(`${folder}/constants.js`, newConstantsBuffer);

    console.log('- writing selectors');
    fs.writeFileSync(`${folder}/selectors.js`, newSelectorsBuffer);

    console.log('- writing selectors tests');
    fs.writeFileSync(
      `${folder}/tests/selectors.test.js`,
      newSelectorsTestsBuffer,
    );

    console.log('- writing index');
    fs.writeFileSync(`${folder}/index.js`, newIndexBuffer);

    console.log('- writing saga');
    fs.writeFileSync(`${folder}/saga.js`, saga.buffer);

    console.log('- saving old suit file in .suit directory');
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

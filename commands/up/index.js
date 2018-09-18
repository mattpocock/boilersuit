const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const diff = require('deep-diff');
const Cases = require('../../tools/cases');
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
const checkIfBadBuffer = require('../../tools/checkIfBadBuffer');
const printWarning = require('../../tools/printWarning');
const checkErrorsInSchema = require('../../tools/checkErrorsInSchema');
const checkWarningsInSchema = require('../../tools/checkWarningsInSchema');
const checkForConfigFile = require('./checkForConfigFile');
const runPrettier = require('./runPrettier');
const {
  parseCamelCaseToArray,
  cleanFile,
  fixInlineImports,
  transforms,
} = require('../../tools/utils');

const up = (schemaFile, { quiet = false, force = false } = {}) => {
  const schemaBuf = fs.readFileSync(schemaFile).toString();
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
  }
  if (!schema) return;

  const arrayOfDomains = Object.keys(schema).map(key => ({
    ...schema[key],
    domainName: key,
  }));

  /** Checks for an 'extends' keyword */

  const extendsFound = checkExtends({
    arrayOfDomains,
    folder,
    schemaFile,
    schemaBuf,
  });

  if (extendsFound) return;

  const errors = [
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

  /** Check for a previous suit file in folder - force prevents this check */

  if (fs.existsSync(`./.suit/${dotSuitFolder}/suit.old.json`) && !force) {
    if (
      fs.readFileSync(`./.suit/${dotSuitFolder}/suit.old.json`).toString() ===
      schemaBuf
    ) {
      if (warnings.length) {
        console.log(`\n ${folder}suit.json `.bgYellow.black);
        printWarning(warnings);
      } else if (!quiet) {
        console.log(`\n ${folder}suit.json `.bgGreen.black);
        console.log(
          `\n NO CHANGES:`.green +
            ` No changes found in suit file from previous version. Not editing files.`,
        );
      }
      return;
    }
  }

  if (warnings.length) {
    console.log(`\n ${folder}suit.json `.bgYellow.black);
  } else {
    console.log(`\n ${folder}suit.json `.bgGreen.black);
  }

  /** Get a more detailed diff of the changes */

  let keyChanges = [];

  if (fs.existsSync(`./.suit/${dotSuitFolder}/suit.old.json`)) {
    const oldSchemaBuf = fs
      .readFileSync(`./.suit/${dotSuitFolder}/suit.old.json`)
      .toString();

    const differences =
      diff(JSON.parse(oldSchemaBuf), JSON.parse(schemaBuf)) || [];
    keyChanges = [
      ...differences
        .filter(({ kind }) => kind === 'D' || kind === 'N')
        .map(({ path }, index) => {
          if (!differences[index + 1]) return null;
          const newPath = differences[index + 1].path;
          return JSON.stringify(path.slice(0, path.length - 1)) ===
            JSON.stringify(newPath.slice(0, newPath.length - 1))
            ? {
                removed: path,
                added: newPath,
                removedCases: new Cases(
                  parseCamelCaseToArray(path[path.length - 1]),
                ).all(),
                addedCases: new Cases(
                  parseCamelCaseToArray(newPath[newPath.length - 1]),
                ).all(),
              }
            : null;
        })
        .filter(n => n !== null),
      ...differences
        .filter(({ path }) => path.includes('saga'))
        .map(({ lhs, rhs, path }) => ({
          removed: path,
          removedCases: new Cases(parseCamelCaseToArray(lhs)).all(),
          addedCases: new Cases(parseCamelCaseToArray(rhs)).all(),
        })),
    ];
  }

  /** Write reducer */

  const { buffer: newReducerBuffer, errors: domainErrors } = writeReducer({
    folder,
    arrayOfDomains,
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

  const selectorsBuffer = fs.readFileSync(`${folder}/selectors.js`).toString();

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

  const newIndexBuffer = transforms(indexBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, actions, initialState }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();

      return writeIndex({
        buffer: b,
        cases: allDomainCases,
        initialState,
        keyChanges,
        actions,
      });
    }),
  ]);

  /** Write Saga */

  const { errors: sagaErrors, buffer: newSagaBuffer } = writeSaga({
    folder,
    arrayOfDomains,
    keyChanges,
  });

  if (sagaErrors.length) {
    printError(sagaErrors);
    return;
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
  fs.writeFileSync(`${folder}/saga.js`, newSagaBuffer);

  console.log('- saving old suit file in .suit directory');
  if (!fs.existsSync(`./.suit/${dotSuitFolder}`)) {
    fs.mkdirSync(`./.suit/${dotSuitFolder}`);
  }
  fs.writeFileSync(`./.suit/${dotSuitFolder}/suit.old.json`, schemaBuf);

  /** Runs prettier and checks for errors */

  const prettierErrors = runPrettier(folder);

  printWarning([...warnings, ...prettierErrors]);
};

module.exports = up;

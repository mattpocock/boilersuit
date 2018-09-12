const colors = require('colors'); // eslint-disable-line
const { exec } = require('child_process');
const fs = require('fs');
const ajax = require('../ajax');
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
const printError = require('../../tools/printError');
const checkIfNoAllSagas = require('../../tools/checkIfNoAllSagas');
const checkIfBadBuffer = require('../../tools/checkIfBadBuffer');
const printWarning = require('../../tools/printWarning');
const checkErrorsInSchema = require('../../tools/checkErrorsInSchema');
const checkWarningsInSchema = require('../../tools/checkWarningsInSchema');
const checkIfDomainAlreadyPresent = require('../../tools/checkIfDomainAlreadyPresent');
const {
  parseCamelCaseToArray,
  cleanFile,
  fixInlineImports,
  transforms,
  concat,
} = require('../../tools/utils');

const up = schemaFile => {
  const schemaBuf = fs.readFileSync(schemaFile).toString();
  /** Gives us the folder where the schema file lives */
  const folder = schemaFile.slice(0, -9);

  console.log(`\n ${folder}suit.json `.black.bgGreen);

  let schema;
  try {
    schema = JSON.parse(schemaBuf.toString());
  } catch (e) {
    console.log(e);
  }
  if (!schema) return;

  const arrayOfDomains = Object.keys(schema).map(key => ({
    ...schema[key],
    domainName: key,
  }));

  /** Checks for an 'extends' keyword */

  let extendsFound = false;
  arrayOfDomains.forEach(domain => {
    if (domain.extends === 'ajax') {
      let searchTerm = concat([
        `,`,
        `  "${domain.domainName}": {`,
        `    "extends": "ajax"`,
        `  }`,
      ]);
      let index = schemaBuf.indexOf(searchTerm);
      if (index === -1) {
        searchTerm = concat([
          `  "${domain.domainName}": {`,
          `    "extends": "ajax"`,
          `  }`,
        ]);
        index = schemaBuf.indexOf(searchTerm);
      }
      if (index !== -1) {
        extendsFound = true;
        fs.writeFileSync(
          schemaFile,
          schemaBuf.slice(0, index) +
            schemaBuf.slice(index + searchTerm.length),
        );
        ajax(folder, domain.domainName);
        up(schemaFile);
      }
    }
  });

  if (extendsFound) return;

  const errors = [
    ...checkErrorsInSchema(schema, folder),
    ...checkIfBadBuffer(folder),
  ];

  if (errors.length) {
    printError(errors);
    return;
  }

  /** Write Reducers */
  const reducersFile = `${folder}/reducer.js`;
  const reducerBuffer = cleanFile(fs.readFileSync(reducersFile).toString());
  let domainErrors = [];
  const newReducerBuffer = transforms(reducerBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(
      ({ domainName, initialState, actions, describe }) => b => {
        const cases = new Cases(parseCamelCaseToArray(domainName));
        const allDomainCases = cases.all();
        domainErrors = [
          ...domainErrors,
          ...checkIfDomainAlreadyPresent(folder, allDomainCases, actions),
        ];

        return writeReducer({
          buffer: b,
          cases: allDomainCases,
          initialState,
          actions,
          describe,
        });
      },
    ),
  ]);

  if (domainErrors.length) {
    printError(domainErrors);
    return;
  }

  /** Write Actions */

  const actionsBuffer = fs.readFileSync(`${folder}/actions.js`).toString();

  const newActionsBuffer = transforms(actionsBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, actions }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();

      return writeActions({
        buffer: b,
        cases: allDomainCases,
        actions,
      });
    }),
  ]);

  /** Write Constants */

  const constantsBuffer = fs.readFileSync(`${folder}/constants.js`).toString();

  const newConstantsBuffer = transforms(constantsBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, actions }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();

      return writeConstants({
        buffer: b,
        cases: allDomainCases,
        actions,
        folder,
      });
    }),
  ]);

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
        actions,
      });
    }),
  ]);

  /** Write Saga */

  const sagaBuffer = fs.readFileSync(`${folder}/saga.js`).toString();

  const sagaErrors = checkIfNoAllSagas(sagaBuffer);

  if (sagaErrors.length) {
    printError(sagaErrors);
    return;
  }

  const newSagaBuffer = transforms(sagaBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, actions }) => b => {
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
        return b;
      }

      if (actionsWithSagas < 1) {
        return b;
      }

      const actionCases = new Cases(parseCamelCaseToArray(actionsWithSagas[0]));
      const allActionCases = actionCases.all();

      return writeSaga({
        buffer: b,
        cases: allDomainCases,
        actionCases: allActionCases,
        action: actions[actionsWithSagas[0]],
      });
    }),
  ]);

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
  fs.writeFileSync(reducersFile, newReducerBuffer);

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

  const prettierErrors = [];

  if (fs.existsSync('./.prettierrc')) {
    try {
      exec(`prettier --config ./.prettierrc --write "${folder}/**/*.js"`);
      console.log(`\nPRETTIER: `.green + `Running prettier on this folder from the root config.`);
    } catch (e) {
      console.log(
        concat([
          'No version of prettier found. This will make your files uglier.',
          `- If you're running suit from npm scripts, run npm i prettier`,
          `- If you installed suit by typing npm i -g boilersuit, run npm i -g prettier`,
        ]),
      );
    }
  } else {
    prettierErrors.push(
      concat([
        `I see you're not using prettier!`,
        `- Try adding a .prettierrc to your root directory and suit will make things prettier :)`,
      ]),
    );
  }

  printWarning([...checkWarningsInSchema(schema)]);
};

module.exports = up;

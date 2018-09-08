const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const Cases = require('../../tools/cases');
const writeIndex = require('./writeIndex');
const writeSelectors = require('./writeSelectors');
const writeActions = require('./writeActions');
const writeConstants = require('./writeConstants');
const writeReducer = require('./writeReducer');
const writeSaga = require('./writeSaga');
const printError = require('../../tools/printError');
const checkIfNoAllSagas = require('../../tools/checkIfNoAllSagas');
const checkIfBadBuffer = require('../../tools/checkIfBadBuffer');
const printWarning = require('../../tools/printWarning');
const checkErrorsInSchema = require('../../tools/checkErrorsInSchema');
const checkIfDomainAlreadyPresent = require('../../tools/checkIfDomainAlreadyPresent');
const {
  parseCamelCaseToArray,
  cleanFile,
  fixInlineImports,
  transforms,
  concat,
} = require('../../tools/utils');

const up = schemaFile => {
  // Resets the console
  process.stdout.write('\x1Bc');
  const schemaBuf = fs.readFileSync(schemaFile).toString();
  /** Gives us the folder where the schema file lives */
  const folder = schemaFile.slice(0, -9);

  console.log(
    `\n ${folder}suit.json `.black.bgGreen,
  );

  let schema;
  try {
    schema = JSON.parse(schemaBuf.toString());
  } catch (e) {
    console.log(e);
  }
  if (!schema) return;

  const errors = [...checkErrorsInSchema(schema), ...checkIfBadBuffer(folder)];

  if (errors.length) {
    printError(errors);
    return;
  }
  const arrayOfDomains = Object.keys(schema).map(key => ({
    ...schema[key],
    domainName: key,
  }));

  /** Write Reducers */
  const reducersFile = `${folder}/reducer.js`;
  const reducerBuffer = cleanFile(fs.readFileSync(reducersFile).toString());
  let domainErrors = [];
  const newReducerBuffer = transforms(reducerBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, initialState, actions }) => b => {
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
      });
    }),
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
        printWarning([
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

  console.log('\nCHANGES:'.green);

  console.log('- writing reducers');
  fs.writeFileSync(reducersFile, newReducerBuffer);

  console.log('- writing actions');
  fs.writeFileSync(`${folder}/actions.js`, newActionsBuffer);

  console.log('- writing constants');
  fs.writeFileSync(`${folder}/constants.js`, newConstantsBuffer);

  console.log('- writing selectors');
  fs.writeFileSync(`${folder}/selectors.js`, newSelectorsBuffer);

  console.log('- writing index');
  fs.writeFileSync(`${folder}/index.js`, newIndexBuffer);

  console.log('- writing saga');
  fs.writeFileSync(`${folder}/saga.js`, newSagaBuffer);
};

module.exports = up;

const colors = require('colors'); // eslint-disable-line
const fs = require('fs');
const Cases = require('../../tools/cases');
const writeIndex = require('./writeIndex');
const writeSelectors = require('./writeSelectors');
const writeActions = require('./writeActions');
const writeConstants = require('./writeConstants');
const writeReducer = require('./writeReducer');
// const writeSaga = require('./writeSaga');
const {
  parseCamelCaseToArray,
  cleanFile,
  fixInlineImports,
  transforms,
  checkErrorsInSchema,
} = require('../../tools/utils');

const fromSchema = schemaFile => {
  const schemaBuf = fs.readFileSync(schemaFile);
  /** Gives us the folder where the schema file lives */
  const folder = schemaFile.slice(0, -9);

  console.log(`\n${folder}`.yellow);

  let schema;
  try {
    schema = JSON.parse(schemaBuf.toString());
  } catch (e) {
    console.log(e);
  }
  if (!schema) return;

  const errors = checkErrorsInSchema(schema);
  if (errors.length) {
    errors.forEach(error => console.log('ERROR: '.red + error));
    return;
  }

  const arrayOfDomains = Object.keys(schema).map(key => ({
    ...schema[key],
    domainName: key,
  }));

  /** Write Reducers */
  const reducersFile = `${folder}/reducer.js`;
  const reducerBuffer = cleanFile(fs.readFileSync(reducersFile).toString());
  const newReducerBuffer = transforms(reducerBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, initialState, actions }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();

      return writeReducer({
        buffer: b,
        cases: allDomainCases,
        initialState,
        actions,
      });
    }),
  ]);

  console.log(' - writing reducers');
  fs.writeFileSync(reducersFile, newReducerBuffer);

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

  console.log(' - writing actions');
  fs.writeFileSync(`${folder}/actions.js`, newActionsBuffer);

  /** Write Constants */

  const constantsBuffer = fs.readFileSync(`${folder}/constants.js`).toString();

  const newConstantsBuffer = transforms(constantsBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, actions }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();
      if (!actions) {
        // They will have been warned already, so can fail silently
        return b;
      }

      return writeConstants({
        buffer: b,
        cases: allDomainCases,
        actions,
        folder,
      });
    }),
  ]);

  console.log(' - writing constants');
  fs.writeFileSync(`${folder}/constants.js`, newConstantsBuffer);

  /** Write Selectors */

  const selectorsBuffer = fs.readFileSync(`${folder}/selectors.js`).toString();

  const newSelectorsBuffer = transforms(selectorsBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, initialState }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();
      if (!initialState) {
        // They will have been warned already, so can fail silently
        return b;
      }

      return writeSelectors({
        buffer: b,
        cases: allDomainCases,
        initialState,
        folder,
      });
    }),
  ]);

  console.log(' - writing selectors');
  fs.writeFileSync(`${folder}/selectors.js`, newSelectorsBuffer);

  /** Write Index */

  const indexBuffer = fs.readFileSync(`${folder}/index.js`).toString();

  const newIndexBuffer = transforms(indexBuffer, [
    cleanFile,
    fixInlineImports,
    ...arrayOfDomains.map(({ domainName, actions, initialState }) => b => {
      const cases = new Cases(parseCamelCaseToArray(domainName));
      const allDomainCases = cases.all();
      if (!initialState) {
        // They will have been warned already, so can fail silently
        return b;
      }

      return writeIndex({
        buffer: b,
        cases: allDomainCases,
        initialState,
        actions,
      });
    }),
  ]);

  console.log(' - writing index');
  fs.writeFileSync(`${folder}/index.js`, newIndexBuffer);
};

module.exports = fromSchema;
